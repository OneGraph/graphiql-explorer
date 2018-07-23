#!/bin/bash
set -e

printf '%s\n%s\n' "/* eslint-disable */" "$(cat $1)" > $1
prettier --write $1
