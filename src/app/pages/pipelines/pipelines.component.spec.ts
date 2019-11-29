import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { MaterialModule } from '../../modules';
import { PageHeaderComponent, ProgressBarComponent } from '../../components';
import { FromNowPipe } from '../../pipes';

import { PipelinesComponent } from './pipelines.component';

describe('PipelinesComponent', () => {
  let component: PipelinesComponent;
  let fixture: ComponentFixture<PipelinesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        FromNowPipe,
        PageHeaderComponent,
        PipelinesComponent,
        ProgressBarComponent
      ],
      imports: [
        HttpClientTestingModule,
        MaterialModule,
        NoopAnimationsModule,
        RouterTestingModule
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PipelinesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
