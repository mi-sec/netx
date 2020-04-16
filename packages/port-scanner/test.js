import scan from '@mi-sec/port-scanner';

( async () => console.log( await scan( {
    host: '127.0.0.1',
    port: [ 22 ],
    timeout: 500,
    onlyReportOpen: true,
    bannerGrab: true,
    attemptToIdentify: true
} ) ) )();
