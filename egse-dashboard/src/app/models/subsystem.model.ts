export interface Element {
    name: string;
    label: string;
    type: string;
    editable: boolean;
    graphical: string;
    description: string;
    in_out: 'input' | 'output';
    parameter?: any;
    command?: any;
  }
  
  export interface Group {
    name: string;
    label: string;
    elements: Element[];
  }
  
  export interface Box {
    name: string;
    label: string;
    groups: Group[];
  }
  
  export interface Subsystem {
    name: string;
    label: string;
    boxes: Box[];
  }
  