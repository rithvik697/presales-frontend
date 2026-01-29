import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatabackupsComponent } from './databackups.component';

describe('DatabackupsComponent', () => {
  let component: DatabackupsComponent;
  let fixture: ComponentFixture<DatabackupsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DatabackupsComponent]
    });
    fixture = TestBed.createComponent(DatabackupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
