import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { APP_BASE_HREF, Location, LocationStrategy, PathLocationStrategy } from '@angular/common';

import { MaterialModule } from '../../modules';
import { FromNowPipe } from '../../pipes';
import { PageHeaderComponent, ProgressBarComponent } from '../../components';

import { TagsComponent } from './tags.component';
import { Route } from '@angular/router';

describe('TagsComponent', () => {
  let component: TagsComponent;
  let fixture: ComponentFixture<TagsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        FromNowPipe,
        PageHeaderComponent,
        ProgressBarComponent,
        TagsComponent
      ],
      imports: [
        HttpClientTestingModule,
        MaterialModule,
        NoopAnimationsModule,
        RouterTestingModule,
      ],
      providers: [
        Location,
        { provide: LocationStrategy, useClass: PathLocationStrategy },
        { provide: APP_BASE_HREF, useValue: '/' }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
