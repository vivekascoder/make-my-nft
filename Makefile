SP=~/smartpy-cli/SmartPy.sh
SHELL := /bin/bash
PYTHONPATH := "./"
export PYTHONPATH

test_factory:
	@echo "> Runnning test for Crowdsale Factory."
	$(SP) test ./contracts/factory.py ./output --html
