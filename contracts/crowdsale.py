import smartpy as sp

fa2 = sp.io.import_script_from_url("file:./contracts/FA2.py")
Utils = sp.io.import_script_from_url("file:./contracts/utils.py")
metadata = open("./contracts/json/crowdsale.json").read()
fa2_metadata = open("./contracts/json/fa2.json").read()


class FA2Token(fa2.FA2):
    """ FA2 token contract to hold NFTs. """
    pass


class OracleMockup(sp.Contract):
    """ Oracle to mock Harbinger price oracle. """
    MAGIC_NUMBER = sp.nat(5952962)
    returnType = sp.TRecord(
        string=sp.TString,
        timestamp=sp.TTimestamp,
        price=sp.TNat
    )
    oracleGetType = sp.TPair(
        sp.TString,
        sp.TContract(returnType)
    )

    @sp.entry_point
    def get(self, requestPair):
        sp.set_type(requestPair, sp.TPair(
            sp.TString,
            sp.TContract(
                sp.TPair(
                    sp.TString,
                    sp.TPair(sp.TTimestamp, sp.TNat)
                )
            )
        ))

        # Destructure the arguments.
        requestedAsset = sp.compute(sp.fst(requestPair))
        callback = sp.compute(sp.snd(requestPair))

        # Callback with the requested data.
        normalizedPrice = self.MAGIC_NUMBER
        lastUpdateTime = sp.now
        callbackParam = (requestedAsset, (lastUpdateTime, normalizedPrice))
        sp.transfer(callbackParam, sp.mutez(0), callback)


class CrowdSale(sp.Contract):
    """ Main crowdsale contract. """
    FA2MintParam = sp.TRecord(
        address=sp.TAddress,
        amount=sp.TNat,
        metadata=sp.TMap(sp.TString, sp.TBytes),
        token_id=sp.TNat,
    )

    def string_of_nat(self, params):
        c = sp.map({x: str(x) for x in range(0, 10)})
        x = sp.local('x', params)
        res = sp.local('res', [])
        sp.if x.value == 0:
            res.value.push('0')
        sp.while 0 < x.value:
            res.value.push(c[x.value % 10])
            x.value //= 10
        return sp.concat(res.value)

    def __init__(
        self,
        _admin,
        _developer,
        _devShare,
        _creator,
        _oracleAddress,
        _maxSupply,
        _presaleStart,
        _presaleEnd,
        _presalePrice,
        _presaleMintLimit,
        _templateIPFSPath,
        _publicsaleStart,
        _publicsalePrice,
        _publicsaleMintLimit,
        _metadata,
    ):
        self.init(
            # Required addresses
            admin=_admin,
            developer=_developer,
            creator=_creator,
            devShare=_devShare,
            oracleAddress=_oracleAddress,
            fa2=sp.none,

            # Stats and contract variables
            paused=sp.bool(False),
            saleStarted = sp.bool(False),
            maxSupply=_maxSupply,
            mintIndex=sp.nat(0),
            nMinted=sp.nat(0),
            nAirdropped=sp.nat(0),
            templateIPFSPath=_templateIPFSPath,

            # Information regarding presale
            presaleTime=sp.record(
                start=_presaleStart,
                end=_presaleEnd,
            ),
            presalePrice=_presalePrice,
            presaleMintLimit=_presaleMintLimit,
            presaleAllowance=sp.big_map(
                l={},
                tkey=sp.TAddress,
                tvalue=sp.TRecord(limit=sp.TNat, amount=sp.TNat)
            ),

            # Information regarding public sale.
            publicsaleStart=_publicsaleStart,
            publicsalePrice=_publicsalePrice,
            publicsaleMintLimit=_publicsaleMintLimit,
            publicsaleMinters=sp.big_map(
                l={},
                tkey=sp.TAddress,
                tvalue=sp.TRecord(
                    limit=sp.TNat,
                    minted=sp.TNat,
                )
            ),

            # For contract metadata.
            metadata=sp.big_map(l={
                "": sp.utils.bytes_of_string("tezos-storage:content"),
                "content": _metadata,
            }),
        )

    def checkAdmin(self):
        sp.verify(sp.sender == self.data.admin, "NOT_ADMIN")

    def checkPaused(self):
        sp.verify(self.data.paused == False, "CROWDSALE_PAUSED")

    @sp.private_lambda(
        with_storage="read-write", with_operations=True, wrap_call=True
    )
    def distributeFund(self, amount):
        """ Distribute the share of developer and creator. """
        sp.set_type(amount, sp.TMutez)
        sp.verify(amount > sp.mutez(0), "INVALID_AMOUNT[AMOUNT<0]")

        amountInNat = sp.utils.mutez_to_nat(amount)
        devShare = self.data.devShare * amountInNat / sp.nat(100)
        creatorShare = sp.as_nat(amountInNat - devShare)

        sp.send(self.data.developer, sp.utils.nat_to_mutez(
            devShare), "CANT_SEND_TO_DEV")
        sp.send(self.data.creator, sp.utils.nat_to_mutez(
            creatorShare), "CANT_SEND_TO_CREATOR")

    @sp.entry_point
    def startSale(self):
        self.checkAdmin()

        contract = sp.contract(
            sp.TPair(
                sp.TString,
                sp.TContract(
                    sp.TPair(
                        sp.TString,
                        sp.TPair(sp.TTimestamp, sp.TNat)
                    )
                )
            ),
            self.data.oracleAddress,
            'get'
        ).open_some("WRONG_ORACLE_CONTRACT")
        sp.transfer(
            sp.pair(
                "XTZ-USD",
                sp.self_entry_point(entry_point='oracleCallback'),
            ),
            sp.mutez(0),
            contract
        )
        self.data.saleStarted = sp.bool(True)

    @sp.entry_point
    def oracleCallback(self, params):
        """ Harbinger oracle will call this entry point. """
        sp.set_type(params, sp.TPair(
            sp.TString,
            sp.TPair(sp.TTimestamp, sp.TNat)
        ))

        # Only oracle can call this entry point.
        sp.verify(sp.sender == self.data.oracleAddress, "NOT_ORACLE")

        # price = params.price
        price = sp.snd(sp.snd(params))
        number = sp.local('number', price % self.data.maxSupply)
        sp.if number.value == sp.nat(0):
            number.value = sp.nat(1)
        self.data.mintIndex = number.value


    @sp.entry_point
    def togglePause(self):
        self.checkAdmin()
        self.data.paused = ~self.data.paused

    @sp.private_lambda(
        with_storage="read-write", with_operations=True, wrap_call=True
    )
    def mintNFT(self, params):
        """ 
        Do an intercontract call to FA2 to mint a new token for sp.sender 
        It's a private lambda and can be use in other entry points where
        we need to mint the tokens.
        """
        sp.set_type(params, sp.TRecord(address=sp.TAddress))

        # Sale started ?
        sp.verify(self.data.saleStarted == sp.bool(True), 'SALE_NOT_STARTED')

        # Verify wether there are NFTs to mint
        sp.verify(self.data.nMinted < self.data.maxSupply)
        metadataUri = Utils.Bytes.of_string(
            self.data.templateIPFSPath +
            self.string_of_nat(self.data.mintIndex) +
            ".json"
        )
        mintData = sp.record(
            address=params.address,
            amount=sp.nat(1),
            metadata=sp.map({
                "": metadataUri
            }),
            token_id=self.data.mintIndex,
        )
        contract = sp.contract(
            self.FA2MintParam,
            self.data.fa2.open_some("NOT_A_VALID_FA2_CONTRACT"),
            'mint'
        ).open_some("WRONG_FA2_CONTRACT")

        sp.transfer(mintData, sp.mutez(0), contract)

        # Increase the mintIndex
        sp.if self.data.mintIndex == self.data.maxSupply:
            self.data.mintIndex = sp.nat(1)
        sp.else:
            self.data.mintIndex += 1
        # Increase no of NFT minted
        self.data.nMinted += 1

    @sp.entry_point
    def registerFA2(self, fa2):
        self.checkAdmin()
        self.data.fa2 = sp.some(fa2)

    @sp.entry_point
    def mint(self):
        """
        Checks wether the time is for presale or public sale based on that 
        allows user to mint NFTs.
        """
        self.checkPaused()
        sp.verify(
            ((sp.now >= self.data.presaleTime.start) & (sp.now <= self.data.presaleTime.end)) |
            (sp.now >= self.data.publicsaleStart),
            "NOT_MINT_TIME"
        )

        # presaleStart, presaleEnd, publicsaleStart
        sp.if (sp.now >= self.data.presaleTime.start) & (sp.now <= self.data.presaleTime.end):
            # Time for presale.
            sp.verify(
                self.data.presaleAllowance.contains(sp.sender),
                "NOT_WHITELISTED_FOR_PRESALE"
            )
            sp.verify(
                self.data.presaleAllowance[sp.sender].amount < self.data.presaleMintLimit,
                "CANT_MINT_MORE_THAN_LIMIT[PRE_SALE]"
            )
            sp.verify(sp.amount == self.data.presalePrice,
                      "WRONG_PRESALE_PRICE")

            self.mintNFT(sp.record(address=sp.sender))
            self.data.presaleAllowance[sp.sender].amount += 1

            # distribute money to developer and creator
            self.distributeFund(sp.amount)
        sp.else:
            # Time for public sale.
            # NOTE: Not explicitly checking for publicsale time because already
            # cheking in the verify statement that if it is not in presale time
            # then publicsaleStart <= sp.now, error otherwise.
            sp.if ~self.data.publicsaleMinters.contains(sp.sender):
                self.data.publicsaleMinters[sp.sender] = sp.record(
                    limit=self.data.publicsaleMintLimit,
                    minted=sp.nat(0),
                )
            sp.verify(
                self.data.publicsaleMinters[sp.sender].minted < self.data.publicsaleMinters[sp.sender].limit,
                "CANT_MINT_MORE_THAN_LIMIT[PUBLIC_SALE]"
            )
            sp.verify(sp.amount == self.data.publicsalePrice,
                      "WRONG_PUBLIC_SALE_PRICE")
            self.mintNFT(sp.record(address=sp.sender))
            self.data.publicsaleMinters[sp.sender].minted += 1

            # distribute money to developer and creator
            self.distributeFund(sp.amount)

    @sp.entry_point
    def airdropNFT(self, params):
        """ Airdrop `amount` NFTs to the `address` """
        sp.set_type(params, sp.TRecord(
            address=sp.TAddress,
            amount=sp.TNat,
        ))
        self.checkAdmin()

        sp.for i in sp.range(0, params.amount, step=1):
            self.mintNFT(sp.record(address=params.address))
            self.data.nAirdropped += 1

    @sp.entry_point
    def revealMetadata(self, params):
        updateMetadataType = sp.TList(
            sp.TRecord(
                token_id=sp.TNat,
                metadata=sp.TMap(
                    sp.TString,
                    sp.TBytes,
                )
            )
        )
        sp.set_type(params, updateMetadataType)
        self.checkAdmin()

        # Do an inter contract call to fa2 contract to update the token metadata
        contract = sp.contract(
            updateMetadataType,
            self.data.fa2.open_some("NOT_A_VALID_FA2_CONTRACT"),
            'update_token_metadata'
        ).open_some("WRONG_CONTRACT")

        sp.transfer(params, sp.mutez(0), contract)

    @sp.entry_point
    def whitelistForPresale(self, params):
        """ 
        Whitelist users for the presale.
        """
        sp.set_type(params, sp.TList(sp.TAddress))
        self.checkAdmin()

        sp.for user in params:
            self.data.presaleAllowance[user] = sp.record(
                limit=self.data.presaleMintLimit,
                amount=sp.nat(0),
            )

# ===== COMPILATION TARGET =====


baseIPFSUrl = "ipfs://QmbDX6DseyfThjk7zEH4su9z5ShT944czCKhXbv5Zrcuw1/"
admin = sp.address("tz1UxnruUqq2demYbAHsHkZ2VV95PV8MXVGq")
developer = sp.address("tz1UxnruUqq2demYbAHsHkZ2VV95PV8MXVGq")
creator = sp.address("tz1VRTputDyDYy4GjthJqdabKDVxkD3xCYGc")
oracleAddress = sp.address("KT1PMQZxQTrFPJn3pEaj9rvGfJA9Hvx7Z1CL")


sp.add_compilation_target("CrowdSale", CrowdSale(
    _admin=admin,
    _developer=developer,
    _devShare=sp.nat(15),
    _creator=creator,
    _oracleAddress=oracleAddress,
    _maxSupply=sp.nat(15),
    _presaleStart=sp.timestamp_from_utc(
        year=2022, month=1, day=9, hours=21 - 5, minutes=40 - 30, seconds=0
    ),
    _presaleEnd=sp.timestamp_from_utc(
        year=2022, month=1, day=10, hours=21 - 5, minutes=40 - 30, seconds=0
    ),
    _presalePrice=sp.tez(3),
    _presaleMintLimit=sp.nat(2),
    _templateIPFSPath=baseIPFSUrl,
    _publicsaleStart=sp.timestamp_from_utc(
        year=2022, month=1, day=10, hours=21 - 5, minutes=40 - 30, seconds=0
    ),
    _publicsalePrice=sp.tez(5),
    _publicsaleMintLimit=sp.nat(3),
    _metadata = sp.utils.bytes_of_string(metadata)
))

crowdsale = sp.address("KT1RtXsCb36Ec75Fayawohz3y2CZGNzkCRJP")

sp.add_compilation_target("Token", FA2Token(
    config=fa2.FA2_config(
        non_fungible=True,
        assume_consecutive_token_ids=False
    ),
    admin=admin,
    # crowdsale = admin,
    metadata=sp.big_map({
        "": sp.utils.bytes_of_string("tezos-storage:content"),
        "content": sp.utils.bytes_of_string(fa2_metadata),
    })
))
token = sp.address("KT1TnZRN211fWyLvur1U182nBT8vXxos1JxD")


# ===== CONTRACT TESTING =====
@sp.add_test(name="Test CrowdSale")
def test():
    scenario = sp.test_scenario()
    scenario.table_of_contents()
    scenario.h1("Test CrowdSale")

    admin = sp.test_account("admin")
    alice = sp.test_account("alice")
    bob = sp.test_account("bob")
    developer = sp.address("tz1-developer")
    creator = sp.address("tz1-creator")

    scenario.h2("Creating contracts for testing.")

    oracle = OracleMockup()
    scenario += oracle

    crowdsale = CrowdSale(
        _admin=admin.address,
        _developer=developer,
        _devShare=sp.nat(15),
        _creator=creator,
        _oracleAddress=oracle.address,
        _maxSupply=sp.nat(966),
        _presaleStart=sp.timestamp(0),
        _presaleEnd=sp.timestamp(100),
        _presalePrice=sp.tez(3),
        _presaleMintLimit=sp.nat(2),
        _templateIPFSPath="ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG/",
        _publicsaleStart=sp.timestamp(200),
        _publicsalePrice=sp.tez(5),
        _publicsaleMintLimit=sp.nat(3),
        _metadata = sp.utils.bytes_of_string(metadata),
    )

    token = FA2Token(
        config=fa2.FA2_config(
            non_fungible=True,
            assume_consecutive_token_ids=False
        ),
        admin=admin.address,
        metadata=sp.big_map({
            "": sp.utils.bytes_of_string("tezos-storage:content"),
            "content": sp.utils.bytes_of_string("""{"name": "NFT FA2"}"""),
        })
    )

    scenario += token
    scenario += crowdsale
    # scenario += oracle

    token.whitelist_address(crowdsale.address).run(sender=admin)

    scenario.h2("Registering FA2 contract for our crowdsale.")
    crowdsale.registerFA2(token.address).run(sender=admin)

    scenario.h2("Admin is calling startSale to randomize initial mint index")
    crowdsale.startSale().run(sender=admin)

    scenario.h2("Airdropped 3 NFTs to developer.")
    crowdsale.airdropNFT(
        sp.record(address=developer, amount=3)).run(sender=admin)

    scenario.h2("Admin whitelisting alice for presale.")
    crowdsale.whitelistForPresale([alice.address]).run(sender=admin)

    scenario.h2("Alice minting her 1st NFT")
    scenario.show(crowdsale.balance)
    crowdsale.mint().run(sender=alice, amount=sp.mutez(3000000), now=sp.timestamp(0))
    scenario.show(crowdsale.balance)

    scenario.h2("Alice minting her 2nd NFT")
    crowdsale.mint().run(sender=alice, amount=sp.tez(3), now=sp.timestamp(100))

    scenario.h2("Alice trying to minting her 3rd NFT")
    crowdsale.mint().run(
        sender=alice, amount=sp.tez(3), now=sp.timestamp(100), valid=False
    )

    scenario.h2("Alice trying to minting her 3rd after presale ends")
    crowdsale.mint().run(
        sender=alice, amount=sp.tez(3), now=sp.timestamp(102), valid=False
    )

    scenario.h2(
        "Alice trying to minting her 3rd in public sale with presale price.")
    crowdsale.mint().run(
        sender=alice, amount=sp.tez(3), now=sp.timestamp(200), valid=False
    )

    scenario.h2(
        "Alice trying to minting her 3rd in public sale with correct price.")
    crowdsale.mint().run(
        sender=alice, amount=sp.tez(5), now=sp.timestamp(200)
    )

    scenario.h2("Alice trying to minting her 4th in public sale.")
    crowdsale.mint().run(
        sender=alice, amount=sp.tez(5), now=sp.timestamp(200)
    )

    scenario.h2("Alice trying to minting her 5th in public sale.")
    crowdsale.mint().run(
        sender=alice, amount=sp.tez(5), now=sp.timestamp(200)
    )

    scenario.h2("Alice trying to minting her 6th in public sale.")
    crowdsale.mint().run(
        sender=alice, amount=sp.tez(5), now=sp.timestamp(200), valid=False
    )

    scenario.h2("Revealing the metadata for the NFTs with IDs 1 and 2")
    crowdsale.revealMetadata([
        sp.record(
            token_id=sp.nat(1),
            metadata=sp.map({"": sp.pack("NEEDED NFT")})
        ),
        sp.record(
            token_id=sp.nat(2),
            metadata=sp.map({"": sp.pack("NEEDED NFT")})
        ),
    ]).run(sender=admin)

    scenario.h2("Transfering one nft from alice's account to creator's account.")
    token.transfer([
        sp.record(
            from_=alice.address,
            txs=[
                sp.record(
                    to_=creator,
                    token_id=473,
                    amount=1
                )
            ]
        )
    ]).run(sender=alice)
