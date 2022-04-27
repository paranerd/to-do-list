import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { AccessManagementComponent } from './access-management.component';

describe('AccessManagementComponent', () => {
  let component: AccessManagementComponent;
  let fixture: ComponentFixture<AccessManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccessManagementComponent],
      imports: [HttpClientModule, RouterTestingModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
