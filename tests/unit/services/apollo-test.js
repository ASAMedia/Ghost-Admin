import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Service | apollo', function() {
  setupTest();

  // TODO: Replace this with your real tests.
  it('exists', function() {
    let service = this.owner.lookup('service:apollo');
    expect(service).to.be.ok;
  });
});
