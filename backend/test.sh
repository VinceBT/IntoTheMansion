#!/usr/bin/env bash
COMMAND="npm test"
if [[ "$OSTYPE" == "msys" ]]; then
	start $COMMAND
else
	eval $COMMAND
fi
