import { TestBed } from '@angular/core/testing';

import { SnackbarService } from './snackbar.service';
import { MaterialModule } from '../../modules';

describe('SnackbarService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [ MaterialModule ]
  }));

  it('should be created', () => {
    const service: SnackbarService = TestBed.get(SnackbarService);
    expect(service).toBeTruthy();
  });
});
