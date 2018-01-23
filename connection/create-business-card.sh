#!/usr/bin/env bash

composer card create \
-p connection.json \
-u PeerAdmin \
-c Admin@org1.example.com-cert.pem \
-k 0b0c9153dc97ba499de9c06977260f9e64f905a26e7f330d080afdccb6d5d87a_sk \
-r PeerAdmin -r ChannelAdmin