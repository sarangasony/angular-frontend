import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { Task } from '../../models/task.model';
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
    MatSelectModule
  ],
  templateUrl: './task-form-dialog.component.html',
  styleUrls: ['./task-form-dialog.component.scss']
})
export class TaskFormDialogComponent implements OnInit {
  taskForm: FormGroup;
  isEditMode: boolean;
  statuses: string[] = ['pending', 'in-progress', 'completed']; // Predefined statuses

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<TaskFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { task?: Task }
  ) {
    this.isEditMode = !!data.task;

    this.taskForm = this.fb.group({
      id: [data.task?.id || null],
      user_id: [data.task?.user_id || '', Validators.required],
      title: [data.task?.title || '', Validators.required],
      description: [data.task?.description || ''],
      status: [data.task?.status || this.statuses[0], Validators.required],
      // Convert 'YYYY-MM-DD' string to Date object for mat-datepicker
      due_date: [data.task?.due_date ? new Date(data.task.due_date) : null, Validators.required],
    });
  }

  ngOnInit(): void {}

  onSave(): void {
    if (this.taskForm.valid) {
      const formValue = this.taskForm.value;
      // Convert Date object from mat-datepicker to 'YYYY-MM-DD' string for backend
      formValue.due_date = formValue.due_date ? formValue.due_date.toISOString().split('T')[0] : '';

      this.dialogRef.close(formValue);
    } else {
      this.taskForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}