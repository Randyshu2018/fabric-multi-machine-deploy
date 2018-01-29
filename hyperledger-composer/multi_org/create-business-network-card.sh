#!/usr/bin/env bash
# create business card
composer card create -p connection-org1-only.json -u PeerAdmin \
-c ././../../artifacts/channel/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/signcerts/Admin@org1.example.com-cert.pem \
-k ././../../artifacts/channel/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore/fb4c1468aa5f29bddea18bd97514889271bd7e5678286eff9d94f2c8177b0d98_sk \
-r PeerAdmin -r ChannelAdmin

composer card create -p connection-org1.json -u PeerAdmin \
-c ././../../artifacts/channel/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/signcerts/Admin@org1.example.com-cert.pem \
-k ././../../artifacts/channel/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore/fb4c1468aa5f29bddea18bd97514889271bd7e5678286eff9d94f2c8177b0d98_sk \
-r PeerAdmin -r ChannelAdmin

composer card create -p connection-org2-only.json -u PeerAdmin \
-c ././../../artifacts/channel/crypto-config/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp/signcerts/Admin@org2.example.com-cert.pem \
-k ././../../artifacts/channel/crypto-config/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp/keystore/81c73e828c3f9e3142b840ca07b8c50c501f08e654dd185d789d413d384a1dea_sk \
-r PeerAdmin -r ChannelAdmin

composer card create -p connection-org2.json -u PeerAdmin \
-c ././../../artifacts/channel/crypto-config/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp/signcerts/Admin@org2.example.com-cert.pem \
-k ././../../artifacts/channel/crypto-config/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp/keystore/81c73e828c3f9e3142b840ca07b8c50c501f08e654dd185d789d413d384a1dea_sk \
-r PeerAdmin -r ChannelAdmin

