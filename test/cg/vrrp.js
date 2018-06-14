import path from 'path';
import request from 'supertest';
import test from 'ava';
import createMockServer from '../../index.js';

test.before(async t => {

  const basePath = '/api/v1';
  const mxApiToken = '12345678';

  const {app, server} = await createMockServer({
    rootFolderPath: 'schema/cg/',
    port: 8000,
    host: '0.0.0.0',
    filename: 'vrrp.yaml'
  });

  t.context.server = server;

  t.context.get = (url) => {
    return request(app)
      .get(path.join(basePath, url))
      .set('mx-api-token', mxApiToken);
  };

  t.context.put = (url, data) => {
    return request(app)
      .put(url)
      .set('mx-api-token', mxApiToken)
      .send(data);
  };
});

test.cb('GET /network/vrrp', t => {

  t.context.get('/network/vrrp')
    .expect('Content-Type', /json/)
    .end((err, res) => {
      if (err) {
        throw err;
      }
      // result: { enable: false, status: false }
      t.snapshot(res.body);
      t.end();
    });
});

test.after(t => t.context.server.close());
