COMMAND="npm test"
if [[ "$OSTYPE" == "msys" ]]; then
	start $COMMAND
else
	eval $COMMAND
fi
