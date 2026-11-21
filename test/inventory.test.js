var test = require('node:test');
var assert = require('node:assert');

var inventory = require('../lib/inventory');
var orders = require('../lib/orders');

function product(stock, reserved) {
  return {
    id: 1,
    sku: 'SKU-001',
    name: 'Test product',
    hsn: '1006',
    price: 10,
    stock: stock,
    reserved: reserved
  };
}

test('CURRENT BEHAVIOUR: inventory.check accepts qty 1 when sellable stock is 1', function () {
  var result = inventory.check([product(1, 0)], [{ id: 1, qty: 1 }]);
  assert.deepStrictEqual(result, { ok: true });
});

test('CURRENT BEHAVIOUR: inventory.check rejects qty 2 when sellable stock is 1', function () {
  var result = inventory.check([product(1, 0)], [{ id: 1, qty: 2 }]);
  assert.deepStrictEqual(result, {
    ok: false,
    msg: 'Test product is out of stock (1 sellable available)'
  });
});

test('CURRENT BEHAVIOUR: inventory.check accepts qty 0 when sellable stock is 1', function () {
  var result = inventory.check([product(1, 0)], [{ id: 1, qty: 0 }]);
  assert.deepStrictEqual(result, { ok: true });
});

test('CURRENT BEHAVIOUR: inventory.check accepts the last sellable unit when stock is 4 and reserved is 3', function () {
  var products = [product(4, 3)];

  assert.strictEqual(inventory.getSellableStock(products[0]), 1);
  assert.deepStrictEqual(inventory.check(products, [{ id: 1, qty: 1 }]), { ok: true });
});

test('CURRENT BEHAVIOUR: reserve then cancelling a pending order restores stock and leaves reserved unchanged', function () {
  var products = [product(5, 2)];
  var lineItems = [{
    id: 1,
    sku: 'SKU-001',
    name: 'Test product',
    hsn: '1006',
    price: 10,
    qty: 2
  }];
  var db = {
    products: products,
    orders: [{
      id: 1001,
      date: '01/01/2022',
      customer: 'Walk-in',
      customerId: null,
      paymentMode: 'cash',
      status: 'pending',
      items: lineItems,
      coupon: '',
      subtotal: 20,
      discount: 0,
      tax: 1,
      total: 21
    }],
    customers: []
  };
  var snapshots = [];

  snapshots.push({ stock: products[0].stock, reserved: products[0].reserved });
  inventory.reserve(products, lineItems);
  snapshots.push({ stock: products[0].stock, reserved: products[0].reserved });

  var result = orders.cancel(db, 1001, 'characterization test');
  snapshots.push({ stock: products[0].stock, reserved: products[0].reserved });

  assert.strictEqual(result.ok, true);
  assert.strictEqual(result.order.status, 'cancelled');
  assert.deepStrictEqual(snapshots, [
    { stock: 5, reserved: 2 },
    { stock: 3, reserved: 2 },
    { stock: 5, reserved: 2 }
  ]);
});

test('allows buying the last sellable unit and returns cancelled items to stock exactly once', function () {
  var products = [product(1, 0)];
  var lineItems = [{
    id: 1,
    sku: 'SKU-001',
    name: 'Test product',
    hsn: '1006',
    price: 10,
    qty: 1
  }];
  var db = {
    products: products,
    orders: [{
      id: 1002,
      date: '01/01/2022',
      customer: 'Walk-in',
      customerId: null,
      paymentMode: 'cash',
      status: 'pending',
      items: lineItems,
      coupon: '',
      subtotal: 10,
      discount: 0,
      tax: 0.5,
      total: 10.5
    }],
    customers: []
  };

  assert.deepStrictEqual(inventory.check(products, lineItems), { ok: true });
  inventory.reserve(products, lineItems);
  assert.deepStrictEqual({ stock: products[0].stock, reserved: products[0].reserved }, { stock: 0, reserved: 0 });

  assert.strictEqual(orders.cancel(db, 1002, 'correct behaviour test').ok, true);
  assert.deepStrictEqual({ stock: products[0].stock, reserved: products[0].reserved }, { stock: 1, reserved: 0 });

  assert.strictEqual(orders.cancel(db, 1002, 'second cancellation').ok, false);
  assert.deepStrictEqual({ stock: products[0].stock, reserved: products[0].reserved }, { stock: 1, reserved: 0 });
});
