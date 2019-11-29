import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { MaterialModule } from '../../../modules';
import { PageHeaderComponent, ProgressBarComponent } from '../../../components';
import { FromNowPipe } from '../../../pipes';

import { TagsDetailComponent } from './tags-detail.component';

describe('TagsDetailComponent', () => {
  let component: TagsDetailComponent;
  let fixture: ComponentFixture<TagsDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        FromNowPipe,
        PageHeaderComponent,
        TagsDetailComponent,
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
    fixture = TestBed.createComponent(TagsDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
