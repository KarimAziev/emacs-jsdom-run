import * as https from 'https';
import * as http from 'http';

const request = {
  get: (url: string) => {
    return new Promise((resolve, reject) => {
      /^https:/.test(url)
        ? https
        : http
            .get(url, (resp) => {
              let data = '';
              resp.on('data', (chunk) => {
                data += chunk;
              });
              resp.on('end', () => {
                resolve(data);
              });
            })
            .on('error', (err) => {
              reject('Error: ' + err.message);
            });
    });
  },
};

export { request };
