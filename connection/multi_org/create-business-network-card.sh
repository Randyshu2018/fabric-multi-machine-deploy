#!/usr/bin/env bash

composer card create -p connection-org1-only.json -u PeerAdmin -c Admin@org1.example.com-cert.pem -k 0b0c9153dc97ba499de9c06977260f9e64f905a26e7f330d080afdccb6d5d87a_sk -r PeerAdmin -r ChannelAdmin

composer card create -p connection-org1.json -u PeerAdmin -c Admin@org1.example.com-cert.pem -k 0b0c9153dc97ba499de9c06977260f9e64f905a26e7f330d080afdccb6d5d87a_sk -r PeerAdmin -r ChannelAdmin

composer card create -p connection-org2-only.json -u PeerAdmin -c Admin@org2.example.com-cert.pem -k 8d224eb431eb0217cdd72dc16f52ff93029bfecb2c164f139494dcc3d544ba75_sk -r PeerAdmin -r ChannelAdmin

composer card create -p connection-org2.json -u PeerAdmin -c Admin@org2.example.com-cert.pem -k 8d224eb431eb0217cdd72dc16f52ff93029bfecb2c164f139494dcc3d544ba75_sk -r PeerAdmin -r ChannelAdmin