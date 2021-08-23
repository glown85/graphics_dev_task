import {  Mesh, Animation } from 'babylonjs';


/**
 * bounce animation of an object.
 * its made by calculating each frame of an animation using gravity and the ball speed, than seting the framerate to match the duration
 * 
 * @param node mesh to be aplied the animation
 * @param amplitude initial height of the object to be droped
 * @param duration max duration of the animation
 * @param bounceFactor how much of its velocity it retains after the bounce
 */
 export function applyPhysicsBouncing(node:Mesh, amplitude:number, duration:number, bounceFactor=0.7):void{
	 //reset position and stop previously animation
	(node as any).basicGeometry.resetPosition();
	node._scene.stopAnimation(node);

	//#region error check
	//check if the paramters are correct
	if(bounceFactor >0.99 || bounceFactor<0){
		console.error("bounceFactor out of range");
		return;
	}
	if(amplitude<=0 || duration<=0){
		console.error("invalid parameters");
		return;
	}
	//#endregion
	
	//#region animation paramters
	let frameRate = 60;//1 frame por ms
    let objHeight = parseFloat(node.position.y.toString());//to displace the obj to not pass the ground

	const animation = new Animation("bounce", "position.y", frameRate, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

	let t = 0;               //timed frame to add in calculation
	let frame = 0            //frame to add in keyframe
	let acceleration = -9.8; // gravity
	let firstImpact = false; //start direction: Down
	let tImpact = -1;        //t that the object impacted the ground

	let keyFrames:Array<{ frame: number, value: number }> = [];
	//#endregion

	//put a time limit of 2000 frames, just for safety
	for(let height = amplitude;frame <2000 ;frame++, t+=1/frameRate){

        //before first impact only calculate the downward velocity
		if(!firstImpact){
			height = amplitude + (acceleration/2)*(t*t)
		}
        //after first impact calculate the impact frame and subtract the velocity 
		else{
			height =  -acceleration*tImpact*bounceFactor*t +  (acceleration/2)*(t*t);
		}
		
		//if it hit the ground
		if(height<=0){
			height=0;
			tImpact = !firstImpact ? t: t/2;
			t = 0;
			firstImpact = true;
		}
		height+=objHeight
        //check if the mesh stoped. 0.001 is an error factor to prevent it enter an infinite loop
        //when the bouncefactor was too hight to complete stop the mesh
		if(height == objHeight && keyFrames[keyFrames.length-1].value - height <0.001){
			break;
		}

		keyFrames.push({
			frame: frame,
			value: height,
		});

	}

	//set duration of the animation to param "duration"
	animation.framePerSecond = Math.round(1000*frame/duration);

	//set keyframes of animation
	animation.setKeys(keyFrames);

	//discard older animations
	node.animations.length>0? node.animations[0] = animation: node.animations.push(animation);
	
	//start animation
	node._scene.beginAnimation(node, 0, frame, true);
}

/**
 * bounce animation of an object.
 * its made by setting the height of the drop and the ground heigth, and applying a bounce easing function
 * 
 * @param node mesh to be aplied the animation
 * @param amplitude initial height of the object to be droped
 * @param duration max duration of the animation
 */
export function applyEasingBouncing(node:Mesh, amplitude:number, duration:number):void{
	//reset position and stop previously animation
   (node as any).basicGeometry.resetPosition();

   //#region error check
   if(amplitude<=0 || duration<=0){
	   console.error("invalid parameters");
	   return;
   }
   //#endregion
   
   //#region animation paramters
   const FRAME_RATE = 60;//1 frame por ms
   const OBJ_HEIGHT = node.position.y;//to displace the obj to not pass the ground

   const animation = new Animation("bounce", "position.y", FRAME_RATE, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

   let keyFrames:Array<{ frame: number, value: number }> = [];
   //#endregion

	keyFrames.push({
		frame: 0,
		value: amplitude+OBJ_HEIGHT,
	});
	keyFrames.push({
		frame: FRAME_RATE * 2,
		value: 0 + OBJ_HEIGHT,
	});

	let bounceCount = 0;
	for(let i = amplitude; i >0.1;i/=2 ){
		bounceCount++;
	}


	var easingFunction = new BABYLON.BounceEase(bounceCount,2);

	// For each easing function, you can choose beetween EASEIN (default), EASEOUT, EASEINOUT
	easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);

	// Adding easing function to my animation
	animation.setEasingFunction(easingFunction);

   	//set keyframes of animation
	animation.setKeys(keyFrames);

	//discard older animations
	node.animations.length>0? node.animations[0] = animation: node.animations.push(animation);
   
	//start animation
	node._scene.beginAnimation(node, 0, 120, true);
}


/**
 * bounce animation of an object.
 * its made by changing the interpolation function of the animation, applying an easing in when the obj is dropping, and an easing out when its rising
 * 
 * @param node mesh to be aplied the animation
 * @param amplitude initial height of the object to be droped
 * @param duration max duration of the animation
 * @param bounceFactor how much of its velocity it retains after the bounce
 */
export function applyBouncing(node:Mesh, height=10, duration:number, bounceFactor = 0.7){
	const MINIMUN_HEIGHT = 0.1; //
	const OBJ_HEIGHT = node.position.y;//to displace the obj to not pass the ground
	const BOUNCE_FACTOR = bounceFactor;
	let frameRate = 30;

	const animation = new Animation("bounce", "position.y", frameRate, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

	let currentHeight = height;
	let frame = 0;

	let keyFrames:Array<{frame:number, value:number}> = [{
		frame: frame,
		value:currentHeight+OBJ_HEIGHT
	}]

	currentHeight*=BOUNCE_FACTOR;
	for(frame+=frameRate; currentHeight>=MINIMUN_HEIGHT;frame+=frameRate,currentHeight*=BOUNCE_FACTOR, frameRate*=BOUNCE_FACTOR){
		keyFrames.push(
			{
				frame:frame,
				value:OBJ_HEIGHT
			},
		);

		frame+=frameRate;

		keyFrames.push(
			{
				frame:frame,
				value:currentHeight+OBJ_HEIGHT
			},
		);
		
	}
	keyFrames.push(
		{
			frame:frame,
			value:OBJ_HEIGHT
		},
	);
	
	//change the interpolation function
	animation.floatInterpolateFunction = function (startValue, endValue, gradient) {
		if(startValue < endValue){
			//if its rising, use an easing in for the gradient
			return startValue + (endValue - startValue) * (1 - (1 - gradient) * (1 - gradient))
		}
		else{
			//if its dropping, use an easing out
			return startValue + (endValue - startValue) * (gradient * gradient);
		}
	};

	animation.setKeys(keyFrames);

	animation.framePerSecond = Math.round(1000*frame/duration);
	
	node.animations.push(animation);
	node._scene.beginAnimation(node, 0, frame, false);
}

/**
 * bounce animation of an object.
 * only setting keyframes, for debbuging and comparing purpose
 * 
 * @param node mesh to be aplied the animation
 * @param amplitude initial height of the object to be droped
 * @param duration max duration of the animation
 */
export function applyDryBouncing(node:Mesh, height=10, duration:number){
	let frameRate = 30;
	let bounceFactor = 0.7;

	const animation = new Animation("bounce", "position.y", frameRate, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

	
	let objHeight = parseFloat(node.position.y.toString());//to displace the obj to not pass the ground

	let currentHeight = height;
	let frame = 0;

	let keyFrames:Array<{frame:number, value:number}> = [{
		frame: frame,
		value:currentHeight+objHeight
	}]
	currentHeight*=bounceFactor;
	for(frame+=frameRate; currentHeight>1;frame+=frameRate,currentHeight*=bounceFactor, frameRate*=bounceFactor){
		keyFrames.push(
			{
				frame:frame,
				value:objHeight
			},
		);
		frame+=frameRate;

		keyFrames.push(
			{
				frame:frame,
				value:currentHeight+objHeight
			},
		);
		
	}
	keyFrames.push(
		{
			frame:frame,
			value:objHeight
		},
	);
	
	animation.setKeys(keyFrames);

	animation.framePerSecond = Math.round(1000*frame/duration);
	
	node.animations.push(animation);
	node._scene.beginAnimation(node, 0, frame, true);
}
