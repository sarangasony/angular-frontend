import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card'; // Import MatCardModule
import { MatFormFieldModule } from '@angular/material/form-field'; // For filter input
import { MatInputModule } from '@angular/material/input'; // For filter input

import { Task } from '../../models/task.model';
import { TaskService } from '../../services/task.service';
import { TaskFormDialogComponent } from '../task-form-dialog/task-form-dialog.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-task',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatCardModule, // Added
    MatFormFieldModule, // Added
    MatInputModule, // Added
  ],
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss'],
})
export class TaskComponent implements OnInit {
  // Updated displayedColumns to reflect new backend fields
  displayedColumns: string[] = [
    'id',
    'title',
    'status',
    'due_date',
    'created_at',
    'actions',
  ];
  dataSource = new MatTableDataSource<Task>();
  isLoading = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private taskService: TaskService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadTasks(): void {
    this.isLoading = true;
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.dataSource.data = tasks;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load tasks', err);
        this.snackBar.open('Failed to load tasks!', 'Close', {
          duration: 3000,
        });
        this.isLoading = false;
      },
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openAddTaskDialog(): void {
    const dialogRef = this.dialog.open(TaskFormDialogComponent, {
      width: '500px',
      data: {}, // No task data means add mode
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const { user_id, title, description, status, due_date } = result;
        this.taskService
          .addTask({ user_id, title, description, status, due_date })
          .subscribe({
            next: (newTask) => {
              this.snackBar.open('Task added successfully!', 'Close', {
                duration: 3000,
              });
              this.loadTasks(); // Reload tasks to update the table
            },
            error: (err) => {
              console.error('Error adding task', err);
              this.snackBar.open('Failed to add task!', 'Close', {
                duration: 3000,
              });
            },
          });
      }
    });
  }

  openEditTaskDialog(task: Task): void {
    const dialogRef = this.dialog.open(TaskFormDialogComponent, {
      width: '500px',
      data: { task: { ...task } }, // Pass a copy of the task for editing
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // If result is not undefined (user clicked save)
        // result will contain all form fields, including 'id' for update
        this.taskService.updateTask(result).subscribe({
          next: (updatedTask) => {
            this.snackBar.open('Task updated successfully!', 'Close', {
              duration: 3000,
            });
            this.loadTasks(); // Reload tasks to update the table
          },
          error: (err) => {
            console.error('Error updating task', err);
            this.snackBar.open('Failed to update task!', 'Close', {
              duration: 3000,
            });
          },
        });
      }
    });
  }

  openDeleteConfirmDialog(task: Task): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Confirm Deletion',
        message: `Are you sure you want to delete the task "${task.title}"?`,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // If result is true (user confirmed)
        this.taskService.deleteTask(task.id).subscribe({
          next: () => {
            // Changed from (deleted) => to just () => as backend DELETE typically returns void
            this.snackBar.open('Task deleted successfully!', 'Close', {
              duration: 3000,
            });
            this.loadTasks(); // Reload tasks
          },
          error: (err) => {
            console.error('Error deleting task', err);
            this.snackBar.open('Failed to delete task!', 'Close', {
              duration: 3000,
            });
          },
        });
      }
    });
  }
}
