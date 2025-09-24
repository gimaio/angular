import { TestBed } from '@angular/core/testing';

import { IrisTrackerService } from './iris-tracker.service';

describe('IrisTrackerService', () => {
  let service: IrisTrackerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IrisTrackerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
