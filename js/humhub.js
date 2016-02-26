var humhub = humhub || {};

humhub.modules = (function(module, $) {
    var _handler = {};
    var _errorHandler = {};
    
    var DATA_ACTION = 'action';
    
    module.registerHandler = function(id, handler) {
        if(!id) {
            return;
        }
        
        if(handler) {
            _handler[id] = handler;
        }
    };
    
    module.registerAjaxHandler = function(id, success, error, cfg) {
        if(!id) {
            return;
        }
        
        if($.isPlainObject(success)) {
            error = success.error;
            success = success.success;
        }
        
        if(success) {
            _handler[id] = function(event) {
                var url = $(this).data('url-'+event.type) || $(this).data('url');
               
                //module.ajax(url, 
            }
        }
        
        if(error) {
            _errorHandler[id] = success;
        }
    };
    
    module.bindAction = function(parent, type, selector) {
        parent = parent || document;
        var $parent = parent.jquery ? parent : $(parent);
        $parent.on(type, selector, function(evt) {
            evt.preventDefault();
            //The element which triggered the action e.g. a button or link
            $trigger = $(this);
            var handlerId = $trigger.data(DATA_ACTION+'-'+type);
            var handler = _handler[handlerId];
            var event = {type:type, $trigger:trigger};
            handler.apply($trigger, [event]);
        });
    };
    
    module.bindAction(document, 'click', '[data-action-click]');
    
    /**
     * Response Wrapper Object for
     * easily accessing common data
     */
    var Response = function(data) {
        this.data = data;
    };

    Response.prototype.isConfirmation = function() {
        return this.data && (this.data.status === 0);
    };

    Response.prototype.isError = function() {
        return this.data && this.data.status && (this.data.status > 0);
    };

    Response.prototype.getErrors = function() {
        return this.data.errors;
    };

    Response.prototype.getErrorCode = function() {
        return this.data.errorCode;
    };

    Response.prototype.toString = function() {
        return "{ status: "+this.data.status+" error: "+this.data.error+" data: "+this.data.data+" }";
    };
    
    var errorHandler = function(cfg, xhr,type,errorThrown, errorCode) {
        errorCode = (xhr) ? xhr.status : parseInt(errorCode);
        console.warn("ajaxError: "+type+" "+errorThrown+" - "+errorCode);

        if(cfg.error && object.isFunction(cfg.error)) {
            // "timeout", "error", "abort", "parsererror" or "application"
            cfg.error(errorThrown, errorCode, type);
        } else if(cfg.error) {
            var msg = cfg.error[errorCode] || cfg.error['default'];
            if(object.isDefined(msg)) {
                event.trigger('error', msg);
            }
        }

        if(!cfg.error && !cfg.errorMessage) {
            console.warn('Unhandled ajax error: '+path+" type"+type+" error: "+errorThrown);
        }
    };
    
    module.ajax = function(path, cfg) {
        var cfg = cfg || {};
        var async = cfg.async || true;
        var dataType = cfg.dataType || "json";
        
        var error = function(xhr,type,errorThrown, errorCode) {
            errorHandler(cfg, xhr,type,errorThrown, errorCode);
        };

        var success = function(response) {
            var responseWrapper = new Response(response);

            if(responseWrapper.isError()) { //Application errors
                return error(undefined,"application",responseWrapper.getError(), responseWrapper.getErrorCode());
            } else if(cfg.success) {
                cfg.success(responseWrapper);
            }
        };

        $.ajax({
            url: path,
            //crossDomain: true, //TODO: read from config
            type : cfg.type,
            processData : cfg.processData,
            contentType: cfg.contentType,
            async : async,
            dataType: dataType,
            success: success,
            error: error
        });
    }
    
    
    return module;
})(humhub.modules || {}, $);

humhub.core = (function(module, $) {
    
    var ENTRY_ID_SELECTOR_PREFIX = '#wallEntry_';
    var WALLSTREAM_ID = 'wallStream';
    
    module.Entry = function(id) {
      if(typeof id === 'string') {
          this.id = id;
          this.$ = $('#'+id);
      } else if(id.jquery) {
          this.$ = id;
          this.id = this.$.attr('id');
      }
    };
    
    module.Entry.prototype.remove = function() {
        this.$.remove();
    };
    
    module.Entry.prototype.highlightContent = function() {
        var $content = this.getContent();
        $content.addClass('highlight');
        $content.delay(200).animate({backgroundColor: 'transparent'}, 1000, function() {
            $content.removeClass('highlight');
            $content.css('backgroundColor', '');
        });
    };
    
    module.Entry.prototype.getContent = function() {
        return this.$.find('.content');
    };
    
    module.Stream = function(id) {
        this.id = id;
        this.$ = $('#'+id);
    };
    
    module.Stream.prototype.getEntry = function(id) {
        return new module.Entry(this.$.find(ENTRY_ID_SELECTOR_PREFIX+id));
    };
    
    module.Stream.prototype.wallStick = function(url) {
        $.ajax({
            dataType: "json",
            type: 'post',
            url: url
        }).done(function (data) {
            if (data.success) {
                if (currentStream) {
                    $.each(data.wallEntryIds, function (k, wallEntryId) {
                        currentStream.deleteEntry(wallEntryId);
                        currentStream.prependEntry(wallEntryId);
                    });
                    $('html, body').animate({scrollTop: 0}, 'slow');
                }
            } else {
                alert(data.errorMessage);
            }
        });
    };

    module.Stream.prototype.wallUnstick = function(url) {
        $.ajax({
            dataType: "json",
            type: 'post',
            url: url
        }).done(function (data) {
            if (data.success) {
                //Reload the whole stream, since we have to reorder the entries
                currentStream.showStream();
            }
        });
    };

    /**
     * Click Handler for Archive Link of Wall Posts
     * (archiveLink.php)
     * 
     * @param {type} className
     * @param {type} id
     */
    module.Stream.prototype.wallArchive = function(id) {

        url = wallArchiveLinkUrl.replace('-id-', id);

        $.ajax({
            dataType: "json",
            type: 'post',
            url: url
        }).done(function (data) {
            if (data.success) {
                if (currentStream) {
                    $.each(data.wallEntryIds, function (k, wallEntryId) {
                        //currentStream.reloadWallEntry(wallEntryId);
                        // fade out post
                        setInterval(fadeOut(), 1000);

                        function fadeOut() {
                            // fade out current archived post
                            $('#wallEntry_' + wallEntryId).fadeOut('slow');
                        }
                    });
                }
            }
        });
    };


    /**
     * Click Handler for Un Archive Link of Wall Posts
     * (archiveLink.php)
     * 
     * @param {type} className
     * @param {type} id
     */
    module.Stream.prototype.wallUnarchive = function(id) {
        url = wallUnarchiveLinkUrl.replace('-id-', id);

        $.ajax({
            dataType: "json",
            type: 'post',
            url: url
        }).done(function (data) {
            if (data.success) {
                if (currentStream) {
                    $.each(data.wallEntryIds, function (k, wallEntryId) {
                        currentStream.reloadWallEntry(wallEntryId);
                    });

                }
            }
        });
    };

    
    module.getStream = function() {
        if(!module.mainStream) {
            module.mainStream = new module.Stream(WALLSTREAM_ID);
        }
        return module.mainStream;
    };
    
    module.getEntry = function(id) {
        return module.getStream().getEntry(id);
    };
    
    return module;
})(humhub.core || {}, $);