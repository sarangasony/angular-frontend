import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmDialogComponent } from './confirm-dialog.component';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

describe('ConfirmDialogComponent', () => {
  let component: ConfirmDialogComponent;
  let fixture: ComponentFixture<ConfirmDialogComponent>;

  let mockMatDialogRef: jasmine.SpyObj<MatDialogRef<ConfirmDialogComponent>>;

  const MOCK_DIALOG_DATA = {
    title: 'Confirm Deletion',
    message: 'Are you sure you want to delete this item?'
  };

  beforeEach(async () => {
    mockMatDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [
        ConfirmDialogComponent,
      ],
      providers: [
        { provide: MatDialogRef, useValue: mockMatDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: MOCK_DIALOG_DATA }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the correct message', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain(MOCK_DIALOG_DATA.message);
  });

  it('should close the dialog with true when onConfirm is called', () => {
    component.onConfirm();
    expect(mockMatDialogRef.close).toHaveBeenCalledWith(true);
  });

  it('should close the dialog with false when onCancel is called', () => {
      component.onCancel();
      expect(mockMatDialogRef.close).toHaveBeenCalledWith(false);
  });
});