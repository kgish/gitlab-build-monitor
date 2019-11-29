import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { PageHeaderComponent } from '../../components';

import { HomeComponent } from './home.component';
import { AuthService } from '../../services/auth';
import { Subject } from 'rxjs';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule
      ],
      declarations: [
        HomeComponent,
        PageHeaderComponent
      ],
      providers: [
        {
          provide: AuthService,
          useClass: class {
            loggedIn = true;
            loggedInChanged = new Subject<boolean>();
            login() { }
          }
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render title in a h1 tag', () => {
    const el = fixture.debugElement.nativeElement;
    expect(el.querySelector('h1').textContent).toContain('Welcome');
  });
});
