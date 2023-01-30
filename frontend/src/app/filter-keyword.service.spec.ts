import { TestBed } from '@angular/core/testing';

import { FilterKeywordService } from './filter-keyword.service';

describe('FilterKeywordService', () => {
  let service: FilterKeywordService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FilterKeywordService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
