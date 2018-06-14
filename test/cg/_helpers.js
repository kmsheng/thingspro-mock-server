import request from 'supertest';
import path from 'path';

export const BASE_PATH = '/api/v1';
export const MX_API_TOKEN = '123456';

export const get = (app, url) => {
  return request(app)
    .get(path.join(BASE_PATH, url))
    .set('mx-api-token', MX_API_TOKEN);
};

export const put = (app, url, data) => {
  return request(app)
    .put(url)
    .set('mx-api-token', MX_API_TOKEN)
    .send(data);
};
