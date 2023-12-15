let didJWT = require("did-jwt");

const did = 'did:ion:EiDb1xWdixRD0ekpf1pTvSEFuI0IIfXAr_7HfXVREkodzg:eyJkZWx0YSI6eyJwYXRjaGVzIjpbeyJhY3Rpb24iOiJyZXBsYWNlIiwiZG9jdW1lbnQiOnsicHVibGljS2V5cyI6W3siaWQiOiJhdXRoLWtleSIsInB1YmxpY0tleUp3ayI6eyJjcnYiOiJzZWNwMjU2azEiLCJrdHkiOiJFQyIsIngiOiJGaUpFU3A2Yk9CZkVOUzE2MlFIYnZzdUxJdnluUHpZLXdUR1FQYTk0N1VjIiwieSI6IjU2TmF3RFdVZnFTWk5TazlwSkNrY3BFZHgwd0RCUWZCRGFfU2I0SlpIeWcifSwicHVycG9zZXMiOlsiYXV0aGVudGljYXRpb24iLCJrZXlBZ3JlZW1lbnQiXSwidHlwZSI6IkVjZHNhU2VjcDI1NmsxVmVyaWZpY2F0aW9uS2V5MjAxOSJ9XSwic2VydmljZXMiOlt7ImlkIjoiZG9tYWluLTEiLCJzZXJ2aWNlRW5kcG9pbnQiOnsib3JpZ2lucyI6WyJodHRwczovL2tnaWczLmF6dXJld2Vic2l0ZXMubmV0LyJdfSwidHlwZSI6IkxpbmtlZERvbWFpbnMifV19fV0sInVwZGF0ZUNvbW1pdG1lbnQiOiJFaUNPT1lqSkxvSjh5cVRnQm01RXBoMkdLQzlLSTAyQWxETVVwYVByNDNpd3J3In0sInN1ZmZpeERhdGEiOnsiZGVsdGFIYXNoIjoiRWlBbW5RZ01MVjdndWtkWTc1MXpFOFlsZ201UjF4cUxSTmdydGRlX3dralVyZyIsInJlY292ZXJ5Q29tbWl0bWVudCI6IkVpREpCY3l1cXpBTGsyT0Rjd0R1ZjlpYTVXRGotS1VQVjdQcVNwUjFuTUN2VWcifX0';
const signer = didJWT.ES256KSigner('055405826100ef629f9b509bec9ce47cffeb38a6bd81780334c7a3952c363a8e');
const domain = 'https://kgig3.azurewebsites.net/';

const performer = {
    1: 'IIJ けいおん部 ブルースブラザーズバンド',
    2: 'しめ鯖☆甘し',
    3: 'ZH(仮)',
    4: 'ARP',
    5: 'ONOBAND',
    6: '（誰も知らない）'
};

module.exports.did = did;
module.exports.signer = signer;
module.exports.domain = domain;
module.exports.performer = performer;
