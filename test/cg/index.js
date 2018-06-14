import test from 'ava';
import createMockServer from '../../index.js';
import {get, put} from './_helpers';

test.before(async t => {

  const {app, server} = await createMockServer({
    rootFolderPath: 'schema/cg/',
    port: 8000,
    host: '0.0.0.0'
  });

  t.context.server = server;

  t.context.get = get.bind(null, app);

  t.context.put = put.bind(null, app);
});

test.cb('GET /network/cellulars', t => {

  t.context.get('/network/cellulars')
    .expect('Content-Type', /json/)
    .end((err, res) => {
      if (err) {
        throw err;
      }
      const [row] = res.body;
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
      t.snapshot(res.body);
      t.end();
    });
});

test.after(t => t.context.server.close());
