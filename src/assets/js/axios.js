import axios from "axios";
import { baseURL } from "./urls";

const axiosInstance = axios.create({
  baseURL: baseURL.API_URL,
  withCredentials: true,
  headers: {
    common: {
      "Content-Type": "application/json",
    },
    Authorization: `Bearer ${JSON.parse(localStorage.getItem("token"))}`,
  },
});
export default axiosInstance;

// function getOnFulfilled () {
//   return async ( request ) => {
//     if ( request.url !== '/api/csrf-cookie' ) {
//       let token = Cookie.get ( 'XSRF-TOKEN' );
//       if ( !token ) {
//         await axiosInstance.get ( '/api/csrf-cookie')
//       }
//     }
//     return request
//   };
// }

// function getOnRejected () {
//   return function ( error ) {
//     if ( isNetworkError () ) return Promise.reject ( error );
//     function isUnauthorized () {
//       return error.response.status === 401;
//     }

//     function isCSRFTokenMismatch () {
//       if(error.response.status === 419){
//           return true;
//       }
//       if(error.response.status === 500  && [ 'CSRF token mismatch.', 'The payload is invalid.' ].includes ( error.response.data.message )){
//         return true;
//       }
//       // return error.response.status === 500
//       //   && [ 'CSRF token mismatch.', 'The payload is invalid.' ].includes ( error.response.data.message );
//     }

//     function isNetworkError () {
//       return error.response === undefined;
//     }

//     if ( isUnauthorized () || isCSRFTokenMismatch () ) {
//       store.commit ( 'resetState' );
//       store.dispatch ( 'reset' ).then ( () => {
//         document.cookie = "XSRF-TOKEN= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
//         Cookie.remove ( 'XSRF-TOKEN', { path : '/', domain : '.stafftimerapp.com', sameSite : 'lax' } );
//         Cookie.remove ( 'stafftimerapp_session', {
//           path : '/', domain : '.stafftimerapp.com', sameSite : 'lax'
//         });
//         location.reload ( true )
//       } )
//     }
//     return Promise.reject ( error );
//   };
// }

// axiosInstance.interceptors.request.use ( getOnFulfilled () );
// axiosInstance.interceptors.response.use ( null, getOnRejected () );
