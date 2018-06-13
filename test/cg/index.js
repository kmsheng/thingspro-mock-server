import test from 'ava';
import request from 'supertest';
import createMockServer from '../../index.js';
import path from 'path';

test.before(async t => {

  const basePath = '/api/v1';
  const mxApiToken = '12345678';

  const {app, server} = await createMockServer({
    rootFolderPath: 'schema/cg/',
    port: 8000,
    host: '0.0.0.0'
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

test.cb('GET /network/cellulars', t => {

  t.context.get('/network/cellulars')
    .expect('Content-Type', /json/)
    .end((err, res) => {
      if (err) {
        throw err;
      }
      const [row] = res.body;

      // 'id', 'name', 'mode', 'signal', 'operatorName',
      // 'lac', 'tac', 'nid', 'cellId', 'bid', 'iccId', 'imsi', 'imei', 'esn',
      // 'pinRetryRemain', 'status', 'mac', 'ip', 'netmask', 'gateway', 'dns',
      // 'usage', 'enable', 'pdpContext', 'pinCode', 'keepalive'
      t.snapshot(Object.keys(row));
      t.end();
    });
});

test.cb('GET /network/cellulars/1', t => {

  t.context.get('/network/cellulars/1')
    .expect('Content-Type', /json/)
    .end((err, res) => {
      if (err) {
        throw err;
      }
      t.snapshot(res.body);
      t.end();
    });
});

test.cb('PUT /network/cellulars/1', t => {

  t.context.put('/network/cellulars/1', {whatever: true})
    .end((err, res) => {
      if (err) {
        throw err;
      }
      // default will return {} without injectMockResponse
      t.snapshot(res.body);
      t.end();
    });
});

test.after(t => t.context.server.close());
