/**
 * Resumable JS for React JS
 * @author Gonzalo Rubino gonzalo_rubino@artear.com || gonzalorubino@gmail.com
 * @version 1.0
 *
 * Creates an uploader component in React, to use with Resumable JS
 * On file added, the upload will begin.
 * 
 * Options values:
 
@param {String} options.uploaderID The uploader ID. Ex: "image-upload"
@param {Array} options.filetypes The allowed files extensions to upload. Ex: "['jpg', 'png']"
@param {String} options.fileAddedMessage The message to print when file is added. Optional. Ex: 'Starting....'
@param {String} options.completedMessage The message to print when file is completely uploaded. Optional. Ex: 'Completed!'
@param {String} options.service The service that will receive the file. Ex: 'http://www.someurl.com/myservice/image.json'
@param {String} options.textLabel The label of the upload. Ex: 'What photo do you want to add?'
@param {String} options.previousText A Text that will be displayed before the component. Optional.
@param {Boolean} options.disableDragAndDrop True to disable Drag and Drop. Enable by default.
@param {Function} options.onUploadErrorCallback Function to call on Upload error. @returns file and message
@param {Function} options.onFileAddedError Function to call on File Added error. @returns file and errorCount
@param {Object} options.headerObject Optional, if you need to add a headers object.
};

 */

'use strict';
import React from 'react';
import FRC from 'formsy-react-components';
import ResumableJS from 'ResumableJS';

const { File } = FRC;

export default class ReactResumableJs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    	progressBar : 0,
    	messageStatus: ''
    };
  }

  componentDidMount() {
  	let self = this;
  	var ResumableField = new ResumableJS({
    	target: self.props.options.service,
	    query: {
	        upload_token:'my_token'
	    },
	    fileType: self.props.options.filetypes,
	    fileTypeErrorCallback : function (file, errorCount) {
	        if (self.props.options.onFileAddedError){
	        	self.props.options.onFileAddedError(file, errorCount);
	        }
	    },
	    testMethod: 'post',
	    testChunks: false,
	    headers: self.props.options.headerObject ? self.props.options.headerObject : {} /* Add your own headers here if needed */
	});

	ResumableField.assignBrowse(document.querySelector('input[type=file]'));

	//Enable or Disable DragAnd Drop
	if (self.props.options.disableDragAndDrop == undefined){
  		ResumableField.assignDrop(document.getElementById('dropTarget'));
  	}

	ResumableField.on('fileAdded', function(file, event){
	    self.setState({
    		messageStatus: self.props.options.fileAddedMessage ? self.props.options.fileAddedMessage : ' Starting upload! '
  		});
	    ResumableField.upload();
	});
	ResumableField.on('fileSuccess', function(file, message){
	    var fileObject = JSON.parse(message);

	    if (fileObject.file != undefined) {
	    	self.setState({
	    		messageStatus: self.props.options.completedMessage ? self.props.options.completedMessage + fileObject.file : ' Completed! : ' + fileObject.file
      		});
	    } else {
	    	self.setState({
	    		messageStatus: self.props.options.errorMessage ? self.props.options.errorMessage + fileObject.error : 'Error uploading file : ' + fileObject.error
      		});
	    }
	});

	ResumableField.on('progress', function(){
	    self.setState({
	    	messageStatus: parseInt(ResumableField.progress() * 100, 10) + '%',
       		progressBar : ResumableField.progress() * 100
      	});
	});

	ResumableField.on('fileError', function(file, message){
		if (self.props.options.onUploadErrorCallback){
	        	self.props.options.onUploadErrorCallback(file, errorCount);
	    } else {
	    	console.log('fileError');
	    	console.log(file);
	    	console.log(message);
	    }
	});
  }

  render() {
    return (
    	<div id='dropTarget'>
    		<p>{this.props.options.previousText ? this.props.options.previousText : ''}</p>
    		<File
    		  id={this.props.options.uploaderID}
    		  className='btn'
              name='images'
              value=''
              label={this.props.options.textLabel ? this.props.options.textLabel : ''}
              accept='image/*'
              capture='camera'
              required
              multiple
            />
            <div id='messageStatus'>{this.messageStatus}</div>
	        <div id='myProgress'></div>
	        <div id='myBar' style={{width: this.state.progressBar + '%'}}></div>
	    </div>
    );
  }
}