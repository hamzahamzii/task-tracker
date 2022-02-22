/* eslint-disable no-console */

import { register } from 'register-service-worker'
import myDebugger from "./console";
register(`${process.env.BASE_URL}service-worker.js`, {
    ready () {
      myDebugger.log(
        'App is being served from cache by a service worker.\n' +
        'For more details, visit https://goo.gl/AFskqB'
      )
    },
    registered () {
      myDebugger.log('Service worker has been registered.')
    },
    cached () {
      myDebugger.log('Content has been cached for offline use.')
    },
    updatefound () {
      myDebugger.log('New content is downloading.')
    },
    updated () {
      myDebugger.log('New content is available; please refresh.')
    },
    offline () {
      myDebugger.log('No internet connection found. App is running in offline mode.')
    },
    error (error) {
      myDebugger.log('Error during service worker registration:', error)
    }
  })
