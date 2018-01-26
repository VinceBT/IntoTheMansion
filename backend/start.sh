#!/usr/bin/env bash

COMMAND="npm start"
if [[ "$OSTYPE" == "msys" ]]; then
	start $COMMAND
else
	eval $COMMAND
fi
