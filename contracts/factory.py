import smartpy as sp 
crowdsale = sp.io.import_script_from_url("file:./contracts/crowdsale.py")

CrowdSale = crowdsale.CrowdSale
fa2 = crowdsale.fa2
metadata = crowdsale.metadata
FA2Token = crowdsale.FA2Token

class CrowdsaleFactory(sp.Contract):
    def __init__(self, _admin, _oracle):
        self.init(
            admin = _admin,
            protocolsShare = sp.nat(5),
            crowdsales = sp.map(l = {},tkey=sp.TAddress, tvalue=sp.TAddress),
            oracle = _oracle,
            usersCrowdsales = sp.map(
                l = {},
                tkey=sp.TAddress,
                tvalue=sp.TList(sp.TAddress)
            )
        )
    
    @sp.entry_point
    def changeProtocolsShare(self, _share: sp.TNat):
        sp.if (_share >= 0) & (_share <= 50):
            self.data.protocolsShare = _share
    
    @sp.entry_point
    def createCrowdsale(
        self,
        _maxSupply: sp.TNat,
        _presaleStart: sp.TTimestamp,
        _presaleEnd: sp.TTimestamp,
        _presalePrice: sp.TMutez,
        _presaleMintLimit: sp.TNat,
        _templateIPFSPath: sp.TString,
        _publicsaleStart: sp.TTimestamp,
        _publicsalePrice: sp.TMutez,
        _publicsaleMintLimit: sp.TNat,
        _metadata: sp.TBytes,
        ):
        """
        Create new Crowdsale + FA2 contract with the information given
        and store the info.
        """
        
        crowdsaleAdmin = sp.sender
        crowdsaleDeveloper = self.data.admin 
        crowdsaleDevShare = self.data.protocolsShare
        crowdsaleCreator = sp.sender 
        crowdsaleOracle = self.data.oracle 

        # Create new FA2 contract.
        newFA2 = FA2Token(
            config = fa2.FA2_config(
                non_fungible = True,
                assume_consecutive_token_ids=False
            ),
            admin = self.data.admin,
            metadata = sp.big_map({
                "": sp.utils.bytes_of_string("tezos-storage:content"),
                "content": sp.utils.bytes_of_string("""{"name": "NFT FA2"}""")
            })
        )
        newFA2Address = sp.create_contract(contract=newFA2)

        newCrowdsale = CrowdSale(
            _admin=crowdsaleAdmin,
            _developer=crowdsaleDeveloper,
            _devShare=crowdsaleDevShare,
            _creator=crowdsaleCreator,
            _oracleAddress=crowdsaleOracle,
            _maxSupply=_maxSupply,
            _presaleStart=_presaleStart,
            _presaleEnd=_presaleEnd,
            _presalePrice=_presalePrice,
            _presaleMintLimit=_presaleMintLimit,
            _templateIPFSPath=_templateIPFSPath,
            _publicsaleStart=_publicsaleStart,
            _publicsalePrice=_publicsalePrice,
            _publicsaleMintLimit=_publicsaleMintLimit,
            _metadata=_metadata,
        )
        newCrowdsaleAddress = sp.create_contract(contract=newCrowdsale)

        self.data.crowdsales[newCrowdsaleAddress] = newFA2Address
        sp.if self.data.usersCrowdsales.contains(sp.sender):
            self.data.usersCrowdsales[sp.sender].push(newCrowdsaleAddress)
        sp.else:
            self.data.usersCrowdsales[sp.sender] = [newCrowdsaleAddress,]

@sp.add_test(name="Test Factory")
def test():
    scenario = sp.test_scenario()
    admin = sp.address("tz1-admin")
    user1 = sp.address("tz1-user1")
    oracle = sp.address("tz1-oracle")

    factory = CrowdsaleFactory(_admin=admin, _oracle=oracle)
    scenario += factory

    factory.createCrowdsale(
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
    ).run(sender=user1)


sp.add_compilation_target('Factory', CrowdsaleFactory(
    _admin = sp.address("tz1UxnruUqq2demYbAHsHkZ2VV95PV8MXVGq"),
    _oracle = sp.address("KT1AdbYiPYb5hDuEuVrfxmFehtnBCXv4Np7r")
))