// components/icons.js

import {
    Plus, Trash2, Archive, ArchiveRestore, CheckCircle, XCircle, Edit3, Search,
    Lock, Unlock, ListTree, Copy, ArrowLeftRight, Shuffle, ChevronsUpDown,
    ArrowUp, ArrowDown, CornerDownLeft, Undo2, Redo2, Eye, EyeOff, CircleSlash,
    CheckSquare, Square
  } from 'lucide-react';

  
  export const IconPlus = Plus;
  export const IconTrash = Trash2;
  export const IconExpired = Archive;
  export const IconNotExpired = ArchiveRestore;
  export const IconAccomplished = CheckCircle;
  export const IconNotAccomplished = XCircle;
  export const IconEdit = Edit3;
  export const IconSearch = Search;
  export const IconLock = Lock;
  export const IconUnlock = Unlock;
  export const IconTree = ListTree;
  export const IconCopy = Copy;
  export const IconRefactor = ArrowLeftRight;
  export const IconShuffle = Shuffle;
  export const IconSort = ChevronsUpDown;
  export const IconSortAsc = ArrowUp;
  export const IconSortDesc = ArrowDown;
  export const IconEnter = CornerDownLeft;
  export const IconPrev = Undo2;
  export const IconNext = Redo2;
  export const IconEye = Eye;
  export const IconEyeOff = EyeOff;
  export const IconSuperEdge = CircleSlash; // Example for super edge icon
  export const IconCheckBox = CheckSquare;
  export const IconCheckBoxOutline = Square;


  export const IconInfo = ({ size = 18, ...props }) => (
      <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
  );
  
  // Toggle Icons
  export const IconToggleRight = ({ size = 20, ...props }) => (
      <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...props}>
          <path d="M16.94 5.94A8.001 8.001 0 0012 4C7.58 4 4 7.58 4 12s3.58 8 8 8 8-3.58 8-8c0-1.04-.2-2.02-.56-2.94l-1.03.39A6.002 6.002 0 0118 12c0 3.31-2.69 6-6 6s-6-2.69-6-6 2.69-6 6-6c1.07 0 2.07.28 2.94.76l.41-1.03A7.95 7.95 0 0016.94 5.94zM12 20a8 8 0 100-16 8 8 0 000 16zm4-8a4 4 0 11-8 0 4 4 0 018 0z"/>
      </svg>
  );
  
  export const IconToggleLeft = ({ size = 20, ...props }) => (
      <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...props}>
          <path d="M7.06 18.06A8.001 8.001 0 0012 20c4.42 0 8-3.58 8-8s-3.58-8-8-8-8 3.58-8 8c0 1.04.2 2.02.56 2.94l1.03-.39A6.002 6.002 0 016 12c0-3.31 2.69-6 6-6s6 2.69 6 6-2.69 6-6 6c-1.07 0-2.07-.28-2.94-.76l-.41 1.03A7.95 7.95 0 007.06 18.06zM12 4a8 8 0 100 16A8 8 0 0012 4zm-4 8a4 4 0 118 0 4 4 0 01-8 0z"/>
      </svg>
  );
  
  export const IconCheckCircle = ({ size = 16, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
  
  export const IconCircle = ({ size = 16, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10"></circle>
    </svg>
  );
  
  