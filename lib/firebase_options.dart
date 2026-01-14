import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      case TargetPlatform.macOS:
        return macos;
      case TargetPlatform.windows:
        return windows;
      case TargetPlatform.linux:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for linux - '
          'you can reconfigure this by running the FlutterFire CLI again.',
        );
      default:
        throw UnsupportedError(
          'DefaultFirebaseOptions are not supported for this platform.',
        );
    }
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyCG0DKeXZw6oTJqr9Poj-oweijED_ERMNY',
    appId: '1:434424765439:web:14753579df958e681ae5ca',
    messagingSenderId: '434424765439',
    projectId: 'ezeatz-40d36',
    authDomain: 'ezeatz-40d36.firebaseapp.com',
    storageBucket: 'ezeatz-40d36.firebasestorage.app',
    measurementId: 'G-8TMYLPNZTT',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyCBIyIrm2zZEj_9UR6o6TbuXA0Nk5DMjFo',
    appId: '1:434424765439:android:f120be4d7811140f1ae5ca',
    messagingSenderId: '434424765439',
    projectId: 'ezeatz-40d36',
    storageBucket: 'ezeatz-40d36.firebasestorage.app',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyBZc8ISHXd0bCqrUSblHl2PCKPyWXegR9s',
    appId: '1:434424765439:ios:f228e83af781382a1ae5ca',
    messagingSenderId: '434424765439',
    projectId: 'ezeatz-40d36',
    storageBucket: 'ezeatz-40d36.firebasestorage.app',
    androidClientId: '434424765439-0tlbg3r8dtlt75n58gj0mlobe27hg6pp.apps.googleusercontent.com',
    iosClientId: '434424765439-efcp2r6gt9n9qoejh2keiogf96g2bne0.apps.googleusercontent.com',
    iosBundleId: 'com.example.ezeEatz',
  );

  static const FirebaseOptions macos = FirebaseOptions(
    apiKey: 'AIzaSyBZc8ISHXd0bCqrUSblHl2PCKPyWXegR9s',
    appId: '1:434424765439:ios:f228e83af781382a1ae5ca',
    messagingSenderId: '434424765439',
    projectId: 'ezeatz-40d36',
    storageBucket: 'ezeatz-40d36.firebasestorage.app',
    androidClientId: '434424765439-0tlbg3r8dtlt75n58gj0mlobe27hg6pp.apps.googleusercontent.com',
    iosClientId: '434424765439-efcp2r6gt9n9qoejh2keiogf96g2bne0.apps.googleusercontent.com',
    iosBundleId: 'com.example.ezeEatz',
  );

  static const FirebaseOptions windows = FirebaseOptions(
    apiKey: 'AIzaSyCG0DKeXZw6oTJqr9Poj-oweijED_ERMNY',
    appId: '1:434424765439:web:d6ebd1d2b829a43f1ae5ca',
    messagingSenderId: '434424765439',
    projectId: 'ezeatz-40d36',
    authDomain: 'ezeatz-40d36.firebaseapp.com',
    storageBucket: 'ezeatz-40d36.firebasestorage.app',
    measurementId: 'G-VND9NMCFBQ',
  );

}