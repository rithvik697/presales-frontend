import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersListEmpComponent } from './users-list-emp.component';

describe('UsersListComponent', () => {
  let component: UsersListEmpComponent;
  let fixture: ComponentFixture<UsersListEmpComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UsersListEmpComponent]
    });
    fixture = TestBed.createComponent(UsersListEmpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
