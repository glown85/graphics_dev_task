import { Mesh, Scene, Vector3, MeshBuilder, ActionManager,ExecuteCodeAction  } from 'babylonjs';

export interface Geometry {
    mesh:Mesh;
    div:HTMLElement;
    name:string;
    scene:Scene;
    position:Vector3;

    resetPosition():void;
    setWidth(width:number):void;
    setHeigth(height:number):void;
    setDepth(depth:number):void;
    setDiameter(diameter:number):void;
    setSize(size:number):void;
    createRangedInput(name:string, inputFunction:Function, min:number, max:number, step:number):HTMLElement;
    createCloseButton(modal:HTMLElement):HTMLElement;
    createAnimationDiv():HTMLElement;
    createHeader(modal:HTMLElement):HTMLElement;
    bindDrag(element:HTMLElement):void

}

export interface BoxGeometry extends Geometry{
    createHtml():HTMLElement;
}

export interface CylinderGeometry extends Geometry{
    createHtml():HTMLElement;
}

export interface SphereGeometry extends Geometry{
    createHtml():HTMLElement;
    setSubdivisions(value:number):void;
}