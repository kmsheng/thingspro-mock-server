import test from 'ava';
import request from 'supertest';
import createMockServer from '../../index.js';
import path from 'path';

test.beforeEach(t => {

  const basePath = '/api/v1';

  const app = createMockServer({
    rootFolderPath: 'schema/cg/',
    port: 8000,
    host: '0.0.0.0'
  });

  t.context.get = (url) => {
    return request(app)
      .get(path.join(basePath, url))
      .set('mx-api-token', '12345678');
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

      const validCellularProps = ['id', 'name', 'mode', 'signal', 'operatorName',
        'lac', 'tac', 'nid', 'cellId', 'bid', 'iccId', 'imsi', 'imei', 'esn',
        'pinRetryRemain', 'status', 'mac', 'ip', 'netmask', 'gateway', 'dns',
        'usage', 'enable', 'pdpContext', 'pinCode', 'keepalive'];

      t.deepEqual(validCellularProps, Object.keys(row));
      t.end();
    });
});
