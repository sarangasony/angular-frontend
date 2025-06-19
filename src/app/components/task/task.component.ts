import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select'; // <-- Add MatSelectModule
import { ReactiveFormsModule } from '@angular/forms'; // <-- Add ReactiveFormsModule

import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

import { Task, TaskStatus } from '../../models/task.model';
import { PaginatedResponse, TaskService, TaskFilters } from '../../services/task.service'; // Assuming TaskService will return PaginatedResponse
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
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule, // Make sure this is added here
    ReactiveFormsModule, // Make sure this is added here
  ],
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss'],
})
export class TaskComponent implements OnInit, AfterViewInit, OnDestroy {
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
  // Use Object.values(TaskStatus) if you want to display 'pending', 'in-progress', etc.
  // Otherwise, if TaskStatus is directly 'pending', 'in-progress', etc., keep it as is.
  //statuses = Object.values(TaskStatus); 
  statuses = TaskStatus;
  totalItems = 0;

  // Filter properties
  currentFilters: TaskFilters = {
    page: 0,
    pageSize: 10,
    status: 'all',
    search: '',
    sortBy: 'created_at',
    sortDirection: 'desc',
  };

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  // Use { static: false } for paginator and sort as they are conditional/dynamic
  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;
  // If you are binding search input with `(input)="onSearchChange()"` and using ElementRef, keep this:
  @ViewChild('searchInput') searchInput!: ElementRef; // Changed 'input' to 'searchInput' for clarity with the template


  constructor(
    private taskService: TaskService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    // Setup search debouncing
    this.searchSubject
      .pipe(
        debounceTime(500), // Wait 500ms after user stops typing
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((searchTerm) => {
        this.currentFilters.search = searchTerm;
        this.currentFilters.page = 0; // Reset to first page
        this.loadTasks();
      });
  }

  ngOnInit(): void {
    // Initial load of tasks
    // IMPORTANT: loadTasks() should only set dataSource.data and totalItems.
    // Paginator properties (length, pageIndex, pageSize) must be set ONLY AFTER paginator is available.
    this.loadTasks();
  }

  ngAfterViewInit(): void {
    // Use a setTimeout to ensure ViewChild elements are available
    // and also to avoid 'ExpressionChangedAfterItHasBeenCheckedError'
      if (this.paginator) {
        // Set initial paginator properties here when it's guaranteed to be available
        this.paginator.pageIndex = this.currentFilters.page!;
        this.paginator.pageSize = this.currentFilters.pageSize!;
        this.paginator.length = this.totalItems; // Initial total items for paginator

        // Setup pagination event subscription
        this.paginator.page
          .pipe(takeUntil(this.destroy$))
          .subscribe((event: PageEvent) => {
            this.currentFilters.page = event.pageIndex;
            this.currentFilters.pageSize = event.pageSize;
            this.loadTasks();
          });
      } else {
        console.warn('MatPaginator not found in ngAfterViewInit. Pagination will not work.');
      }

      if (this.sort) {
        // Setup sorting event subscription
        this.sort.sortChange.pipe(takeUntil(this.destroy$)).subscribe((sort: Sort) => {
          this.currentFilters.sortBy = sort.active;
          this.currentFilters.sortDirection = sort.direction || 'asc';
          this.currentFilters.page = 0; // Reset to first page on sort change
          this.loadTasks();
        });

        // Set the initial sort properties if needed (optional)
        // this.sort.active = this.currentFilters.sortBy!;
        // this.sort.direction = this.currentFilters.sortDirection! as 'asc' | 'desc';
        // this.sort.sortChange.emit({active: this.sort.active, direction: this.sort.direction});
      } else {
        console.warn('MatSort not found in ngAfterViewInit. Sorting will not work.');
      }

      // If you're using `searchInput` with a debounced `onSearchChange`,
      // you don't need a valueChanges subscription for it in ngOnInit.
      // The `onSearchChange` method (triggered by HTML input event)
      // pushes to `searchSubject` which is already subscribed in constructor.
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

   onSearchChange(event: Event): void { // Ensure it accepts 'event: Event'
    const inputElement = event.target as HTMLInputElement; // Get element from event
    const searchValue = inputElement.value?.trim() || '';

    // DEBUG 1: Check if onSearchChange is called and what the raw value is
    console.log('DEBUG 1: onSearchChange triggered. Raw Value:', searchValue);

    this.searchSubject.next(searchValue);

    // DEBUG 2: Check if the searchSubject received the value immediately
    console.log('DEBUG 2: searchSubject.next called with:', searchValue);
  }
  loadTasks(): void {
    this.isLoading = true;
    this.taskService.getTasks(this.currentFilters).subscribe({
      next: (response: PaginatedResponse<Task>) => { // Expecting PaginatedResponse
        this.dataSource.data = response.data;
        this.totalItems = response.total;

        // ONLY update paginator properties IF it's available (i.e., after ngAfterViewInit)
        if (this.paginator) {
          this.paginator.length = this.totalItems;
          // IMPORTANT: Do NOT set pageIndex and pageSize here if they are already being set by the paginator.page subscription.
          // This can lead to infinite loops or incorrect behavior.
          // The currentFilters object is the source of truth, and paginator.page subscription
          // updates currentFilters. When loadTasks() is called from user actions (filter/sort/page),
          // currentFilters is already updated. When loadTasks() is called on init/CRUD success,
          // it uses the currentFilters state.
        }

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

  // Method to handle search input changes via template
  /*onSearchChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const searchValue = inputElement.value?.trim() || '';
    this.searchSubject.next(searchValue);
  }*/

  // Method to handle status filter changes
  setStatusFilter(status: 'all' | TaskStatus): void {
    this.currentFilters.status = status;
    this.currentFilters.page = 0; // Reset to first page
    this.loadTasks();
  }

  // Clear all filters
  clearFilters(): void {
    this.currentFilters = {
      page: 0,
      pageSize: 10,
      status: 'all',
      search: '',
      sortBy: 'created_at',
      sortDirection: 'desc',
    };

    // Clear search input if element is available
    if (this.searchInput) {
      this.searchInput.nativeElement.value = '';
    }

    // Reset paginator and sort views if they exist
    if (this.paginator) {
      this.paginator.firstPage(); // Go to first page
      this.paginator.pageIndex = 0; // Ensure paginator state is correct
      this.paginator.pageSize = 10; // Reset to default size
    }
    if (this.sort) {
      this.sort.active = 'created_at';
      this.sort.direction = 'desc';
      this.sort.sortChange.emit({ active: 'created_at', direction: 'desc' }); // Emit event to update view
    }

    this.loadTasks();
  }

  openAddTaskDialog(): void {
    const dialogRef = this.dialog.open(TaskFormDialogComponent, {
      width: '500px',
      data: {},
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const { user_id, title, description, status, due_date } = result;
        this.taskService
          .addTask({ user_id, title, description, status, due_date })
          .subscribe({
            next: () => {
              this.snackBar.open('Task added successfully!', 'Close', {
                duration: 3000,
              });
              this.loadTasks(); // Reload with current filters
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
      data: { task: { ...task } },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.taskService.updateTask(result).subscribe({
          next: () => {
            this.snackBar.open('Task updated successfully!', 'Close', {
              duration: 3000,
            });
            this.loadTasks(); // Reload with current filters
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
        this.taskService.deleteTask(task.id).subscribe({
          next: () => {
            this.snackBar.open('Task deleted successfully!', 'Close', {
              duration: 3000,
            });
            this.loadTasks(); // Reload with current filters
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