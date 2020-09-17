#!/bin/bash

if [ $# -ne 2 ]; then
	echo "Arguments are missing. ex) ./cc_tea.sh instantiate 1.0.0"
	exit 1
fi

instruction=$1
version=$2

set -ev

#chaincode install
docker exec cli peer chaincode install -n team-manager -v $version -p github.com/team-manager
#chaincode instatiate
docker exec cli peer chaincode $instruction -n team-manager -v $version -C mychannel -c '{"Args":[]}' -P 'OR ("Org1MSP.member", "Org2MSP.member")'
sleep 5
#chaincode invoke user1
#docker exec cli peer chaincode invoke -n team-manager -C mychannel -c '{"Args":["addMember","Kyuyeong", "12345"]}'
#sleep 5
#chaincode query user1
#docker exec cli peer chaincode query -n team-manager -C mychannel -c '{"Args":["readMember","Kyuyeong"]}'

#chaincode invoke add rating
#docker exec cli peer chaincode invoke -n team-manager -C mychannel -c '{"Args":["removeMember","Kyuyeong"]}'
#sleep 5

echo '-------------------------------------END-------------------------------------'
