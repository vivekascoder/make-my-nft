SP=~/smartpy-cli/SmartPy.sh
SHELL := /bin/bash
PYTHONPATH := "./"
export PYTHONPATH

test_factory:
	@echo "> Runnning test for Crowdsale Factory."
	$(SP) test ./contracts/factory.py ./output --html

deploy_factory:
	@echo "> Compiling Crowdsale Factory."
	$(SP) compile ./contracts/factory.py ./output --html

	@echo "> Deploying on testnet."
	$(SP) originate-contract \
		--code ./output/Factory/step_000_cont_0_contract.tz \
		--storage ./output/Factory/step_000_cont_0_storage.tz \
		--rpc https://hangzhounet.smartpy.io
	
	@echo "> Deployed contracts."
