import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PageHeaderComponent } from '../../components';
import { NotFoundComponent } from './not-found.component';

describe('HomePageComponent', () => {
  let component: NotFoundComponent;
  let fixture: ComponentFixture<NotFoundComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        NotFoundComponent,
        PageHeaderComponent
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
