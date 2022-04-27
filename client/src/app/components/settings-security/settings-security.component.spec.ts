import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { SettingsSecurityComponent } from './settings-security.component';

describe('SettingsSecurityComponent', () => {
  let component: SettingsSecurityComponent;
  let fixture: ComponentFixture<SettingsSecurityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SettingsSecurityComponent],
      imports: [HttpClientModule, RouterTestingModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsSecurityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
