#!/usr/bin/env bash
COMMAND="npm run scenario"
if [[ "$OSTYPE" == "msys" ]]; then
	start $COMMAND
else
	eval $COMMAND
fi
