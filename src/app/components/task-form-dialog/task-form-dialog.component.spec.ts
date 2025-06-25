import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskFormDialogComponent } from './task-form-dialog.component';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TaskService } from '../../services/task.service';

describe('TaskFormDialogComponent', () => {
  let component: TaskFormDialogComponent;
  let fixture: ComponentFixture<TaskFormDialogComponent>;

  let mockMatDialogRef: jasmine.SpyObj<MatDialogRef<TaskFormDialogComponent>>;
  let mockTaskService: jasmine.SpyObj<TaskService>;

  const MOCK_DIALOG_DATA = { id: 1, title: 'Existing Task', description: 'desc', status: 'pending', due_date: '2025-01-01', user_id: 1 };

  beforeEach(async () => {
    mockMatDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    mockTaskService = jasmine.createSpyObj('TaskService', ['addTask', 'updateTask']);

    await TestBed.configureTestingModule({
      imports: [
        TaskFormDialogComponent,
        ReactiveFormsModule,
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MatDialogRef, useValue: mockMatDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: MOCK_DIALOG_DATA },
        { provide: TaskService, useValue: mockTaskService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});