import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { Task, TaskStatus } from '../../models/task.model';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-task-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
  ],
  templateUrl: './task-form-dialog.component.html',
  styleUrls: ['./task-form-dialog.component.scss'],
})
export class TaskFormDialogComponent implements OnInit {
  taskForm: FormGroup;
  isEditMode: boolean;
  statuses: TaskStatus[] = Object.values(TaskStatus);

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<TaskFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { task?: Task }
  ) {
    this.isEditMode = !!data.task;

    this.taskForm = this.fb.group({
      id: [data.task?.id || null],
      title: [data.task?.title || '', Validators.required],
      description: [data.task?.description || ''],
      status: [data.task?.status || TaskStatus.Pending, Validators.required],
      due_date: [
        data.task?.due_date ? new Date(data.task.due_date) : null,
        Validators.required,
      ],
    });
  }

  ngOnInit(): void {}

  private formatDate(date: unknown): string {
    if (!(date instanceof Date)) return '';
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onSave(): void {
    if (this.taskForm.valid) {
      const formValue = this.taskForm.value;
      // Convert Date object from mat-datepicker to 'YYYY-MM-DD' string for backend
      formValue.due_date = this.formatDate(formValue.due_date);

      this.dialogRef.close(formValue);
    } else {
      this.taskForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
