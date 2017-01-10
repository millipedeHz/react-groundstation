import React, { Component } from 'react';
import StreamingPageManager from '../StreamingPageManager.js';
import GenericParameterLabel from './GenericParameterLabel.js';
import NumericInput from './NumericInput.js';
import config from '../../config/commConfig';

import io from 'socket.io-client';

let ip = config.Appserver.ip;
let port = config.Appserver.port;

let socket = io.connect(ip + ':' + port, {
			reconnection: true,
			reconnectionDelay: 1000,
			reconnectionDelayMax : 5000,
			reconnectionAttempts: Infinity
		});

class Brakes extends Component {
	constructor(props) {
		super(props)
		this.render = this.render;

		this.state = {
			streamManager: new StreamingPageManager(),
            developmentMode: false,
            developmentModeSelection: 0,
            brakesSelection: 2,
            nextBrakePosition: null,
            brake0Distance: null,
            brake1Distance: null,
		}

        this.labels = [
            {label: "Left Fault Flags", value: "Brake Fault flags 1"},
            {label: "Left I-Beam", value: "Brake I Beam mm 1"},
            {label: "Left Lead screw target", value: "Brake Lead screw mm 1"},
            {label: "Left Lead screw target", value: "Brake Lead screw um 1"},

            {label: "Left Extend Limit", value: "Brake Limit Extend 1"},
            {label: "Left Retract Limit", value: "Brake Limit Retract 1"},
            {label: "Left Extend Edge", value: "Brake Limit Extend Edge 1"},
            {label: "Left Retract Edge", value: "Brake Limit Retract Edge 1"},
            {label: "Left Sw Flags", value: "Brake SW Error 1"},

            {label: "Left ADC Sample", value: "Brake ADC Sample 1"},
            {label: "Left ADC Zero", value: "Brake ADC Zero 1"},
            {label: "Left System Span", value: "Brake System Span 1"},
            {label: "Left Brake Position", value: "Brake Position mm 1"},
            {label: "Left Linear Velocity", value: "Brake Linear Velocity 1"},
            {label: "Left Linear Acceleration", value: "Brake Linear Acceleration 1"},
            {label: "Left Current Screw Position", value: "Brake Current Position 1"},
        ]

        this.labels2 = [
            {label: "Right Fault Flags", value: "Brake Fault flags 2"},
            {label: "Right I-Beam", value: "Brake I Beam mm 2"},
            {label: "Right Lead screw target", value: "Brake Lead screw mm 2"},
            {label: "Right Lead screw target", value: "Brake Lead screw um 2"},

            {label: "Right Extend Limit", value: "Brake Limit Extend 2"},
            {label: "Right Retract Limit", value: "Brake Limit Retract 2"},
            {label: "Right Extend Edge", value: "Brake Limit Extend Edge 2"},
            {label: "Right Retract Edge", value: "Brake Limit Retract Edge 2"},
            {label: "Right Sw Flags", value: "Brake SW Error 2"},

            {label: "Right ADC Sample", value: "Brake ADC Sample 2"},
            {label: "Right ADC Zero", value: "Brake ADC Zero 2"},
            {label: "Right System Span", value: "Brake System Span 2"},
            {label: "Right Brake Position", value: "Brake Position mm 2"},
            {label: "Right Linear Velocity", value: "Brake Linear Velocity 2"},
            {label: "Right Linear Acceleration", value: "Brake Linear Acceleration 2"},
            {label: "Right Current Screw Position", value: "Brake Current Position 2"}
        ]
	}

    componentDidMount() {
        var _this = this;
        socket.emit("FlightControl_Brake:RequestDevelopmentMode");
        socket.on('connect', function() {
			socket.on('FlightControl_Brake:DevelopmentMode', function(data){
                //FlightControl_Brake:RequestDevelopmentMode
                console.log("\n\n\n\n\n\nUI UPDATE DEV MODE FROM POD\n\n\n\n\n",data.developmentMode)
                _this.setState({
                    developmentModeSelection: (data.developmentMode)?1:0,
                    developmentMode: data.developmentMode
                })
			})
		});
    }


    brakesSelectionHandler(changeEvent){
        this.setState({
            brakesSelection: parseInt(changeEvent.currentTarget.value)
        });
    }

    brakesDevModeHandler(changeEvent){
        var _this = this;

        //turn on dev mode
        if(changeEvent.currentTarget.value === '1'){
            var shouldUpdateBrakePosition = confirm("WARNING: You are about to enable development mode. This is a dangerous operation and will damage the magnets.");
            if (shouldUpdateBrakePosition){
                _this.setState({
                    developmentModeSelection: 1,
                    developmentMode: true
                });
                socket.emit('FlightControl_Brake:EnableDevelopmentMode');
            } else {
                _this.setState({
                    developmentModeSelection: 0,
                    developmentMode: false
                });
            }
        }
        //turn off dev mode
        else{
            _this.setState({
                developmentModeSelection: 0,
                developmentMode: false
            });
            socket.emit('FlightControl_Brake:DisableDevelopmentMode');
        }
    }

	brakePositionHandler(changeEvent) {
        this.setState({
            nextBrakePosition: parseInt(changeEvent.currentTarget.value, 10)
        });
    }

    accelStartStream_Brakes(e) {
        e.preventDefault();
        socket.emit('FlightControl:Stream_Brakes');
    }

    updateBrakes() {
        if(this.state.developmentMode){
            var shouldUpdateBrakePosition = confirm("WARNING: You are about to change the brake distance. This is a dangerous operation.");
            if (shouldUpdateBrakePosition){
                socket.emit('FlightControl_Brake:MoveMotorRAW', {command: this.state.brakesSelection, 
                                                                 position: this.state.nextBrakePosition});
            } else {

            }
        }else{
            alert("You need to be in development mode to change the brake position. This is a dangerous operation.")
        }
    }   

	render() {
		var _this = this;
        var buttonClasses = "btn btn-primary " + ((this.state.developmentMode) ? "" : "disabled");
        function isbrakesDevModeActive(){
            if(_this.state.developmentModeSelection === 1){
                return '';
            }
            else
            {
                return 'hidden';
            }
        }

	    return (
            <div className="row">

                <button type="button" className="btn btn-success" onClick={this.accelStartStream_Brakes}  style={{margin:10}}>Stream Brakes Data</button>

                <div className="col-md-6">
                {
                    this.labels.map(function(item, index){
                        return (
                            <div className="row" key={"brakes" + index}>
                                <label>{item.label}</label>
                                <GenericParameterLabel 
                                    StreamingPageManager={_this.state.streamManager} 
                                    parameter={item.value}/>
                            </div>
                        )
                    }, this)
                }
                </div>

                <div className="col-md-6">
                {
                    this.labels2.map(function(item, index){
                        return (
                            <div className="row" key={"brakes" + index}>
                                <label>{item.label}</label>
                                <GenericParameterLabel 
                                    StreamingPageManager={_this.state.streamManager} 
                                    parameter={item.value}/>
                            </div>
                        )
                    }, this)
                }
                </div>

                <div className="col-md-6">
                    <div className="row">
                        <div className="form-group">
                            <label>Development mode</label>
                            <div className="radio">
                                <label htmlFor="dev-mode-off"><input type="radio" id="dev-mode-off" name="brakesDevMode" value="0" 
                                        onChange={_this.brakesDevModeHandler.bind(_this)} 
                                        checked={_this.state.developmentModeSelection === 0}/>OFF</label> 
                            </div> 
                            <div className="radio">
                                <label htmlFor="dev-mode-on"><input type="radio" id="dev-mode-on" name="brakesDevMode" value="1" 
                                        onChange={_this.brakesDevModeHandler.bind(_this)} 
                                        checked={_this.state.developmentModeSelection === 1}/>ON</label>
                            </div>
                        </div>
                    </div>
                    <div className={isbrakesDevModeActive() + " row"}>
                        <NumericInput label="Brake position" 
                                onChange={_this.brakePositionHandler.bind(_this)}/>

                        <label>Brake selection</label>
                        <div className="form-group">
                            <div className="radio">
                                <label htmlFor="brake-selection-0"><input type="radio" id="brake-selection-0" name="brakesSelection" value="0" 
                                        onChange={_this.brakesSelectionHandler.bind(_this)} 
                                        checked={_this.state.brakesSelection === 0} />Left</label>
                            </div> 
                            <div className="radio">
                                <label htmlFor="brake-selection-1"><input type="radio" id="brake-selection-1" name="brakesSelection" value="1" 
                                        onChange={_this.brakesSelectionHandler.bind(_this)} 
                                        checked={_this.state.brakesSelection === 1}/>Right</label>
                            </div>
                            <div className="radio">
                                <label htmlFor="brake-selection-2"><input type="radio" id="brake-selection-2" name="brakesSelection" value="2" 
                                    onChange={_this.brakesSelectionHandler.bind(_this)} 
                                    checked={_this.state.brakesSelection === 2}/>Both</label>
                            </div>
                        </div>
                        <button disabled={(_this.state.developmentMode)?"":"disabled"} className={buttonClasses}
                            onClick={_this.updateBrakes.bind(_this)}>Update brake position</button>
                    </div>
                </div>

            </div>
	    );
	}
}

export default Brakes;

