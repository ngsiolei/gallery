(function ($) {

  $(document).ready(function() {
    $('body').append('<ul id="gallery"></ul>');
    $('body').append('<div id="prevLink"><a href="#">&nbsp;</a></div>');
    $('body').append('<div id="nextLink"><a href="#">&nbsp;</a></div>');
    $('body').append('<div id="controlWrapper"></div>');
    $('#controlWrapper').append('<div id="home"></div>');
    $('#controlWrapper').append('<div id="caption"></div>');
    $('#controlWrapper').append('<div id="control"></div>');
    $('#control').append('<div id="prev"><a href="#">&nbsp;</a></div>');
    $('#control').append('<div id="play"><a href="#">&nbsp;</a></div>');
    $('#control').append('<div id="pause" style="display: none;"><a href="#">&nbsp;</a></div>');
    $('#control').append('<div id="next"><a href="#">&nbsp;</div>');
	});

  $.gallery = function (options) {
    var self = this;
    self.currentIndex = 0;
    self.intval = '';
    self.images = options.images;
    self.title = options['title'] || '';
    self.homeUrl = options.homeUrl || './index.html';
    self.autoplay = options.autoplay || 0;
    self.slideInterval = options.slideInterval || 5000;
    self.target = $('#gallery');
    self.sh = $(window).height();
    self.sw = $(window).width();
    self.loading = true;
    var slideSet = '';

    for (var i = 0; i < self.images.length; i++) {
			slideSet += '<li class="slide-' + i + '"></li>';
    }
    self.target.append(slideSet);

    self.addImage = function (imageIndex, cb) {
      var image =  self.images[imageIndex];
      var img = $('<img src="'+ image['src'] + '" />');
      $('.slide-' + imageIndex).append(img);
      img.load(function () {
			  $(this).data('origWidth', $(this).width());
        $(this).data('origHeight', $(this).height());
        if (cb) cb();
        self.loading = false;
      });
    };
    self.next = function () {
      if (self.loading) return false;
      self.loading = true;
      var nextIndex;
      if (self.currentIndex + 1 > self.images.length -1) {
        nextIndex = 0;
      } else {
        nextIndex = self.currentIndex + 1;
      }
      var prevIndex = self.currentIndex;
      if (self.currentIndex < self.images.length - 1 ) {
        self.currentIndex++;
      } else {
        self.currentIndex = 0;
      }
      self.addImage(nextIndex, function () {
        self.updateCaption(self.currentIndex);
        self.resize();
        $('.slide-' + prevIndex).removeClass('activeslide');
        $('.slide-' + self.currentIndex).addClass('activeslide');
        $('.slide-' + self.currentIndex).animate({opacity: 0}, 0)
                                        .animate({opacity: 1}, 1000);
        $('.slide-' + prevIndex).find('img').empty().remove();
      });
    };
    self.prev = function () {
      if (self.loading) return false;
      self.loading = true;
      var prevIndex;
      if (self.currentIndex - 1 < 0) {
        prevIndex = self.images.length - 1;
      } else {
        prevIndex = self.currentIndex - 1;
      }
      var nextIndex = self.currentIndex;
      if (self.currentIndex > 0 ) {
        self.currentIndex--;
      } else {
        self.currentIndex = self.images.length - 1;
      }
      $('.slide-' + self.currentIndex).addClass('activeslide');
      self.addImage(prevIndex, function () {
        self.updateCaption(self.currentIndex);
        self.resize();
        $('.slide-' + nextIndex).removeClass('activeslide');
        $('.slide-' + self.currentIndex).addClass('activeslide');
        $('.slide-' + self.currentIndex).animate({opacity: 0}, 0)
                                        .animate({opacity: 1}, 1000);
        $('.slide-' + nextIndex).find('img').empty().remove();
      });
    };
    $(window).resize(function(){
        self.resize();
    });
    self.resize = function () {
      $('li>img').each(function () {
        var img = $(this);
	      var origRatio = (img.data('origWidth') / img.data('origHeight')).toFixed(2);
        var possibleWidth = self.target.width();
        var possibleHeight = self.target.height();
        var possibleRatio = possibleWidth / possibleHeight;
        if (possibleRatio >= 1) {
          if (origRatio >= 1) {
            if (img.data('origWidth') >= possibleWidth) {
              img.width(possibleWidth);
              img.height(img.width() / origRatio);
            }
          } else {
            if (img.data('origHeight') >= possibleHeight) {
              img.height(possibleHeight);
              img.width(img.height() * origRatio);
            }
          }
        } else {
          if (origRatio >= 1) {
            if (img.data('origHeight') >= possibleHeight) {
              img.height(possibleHeight);
              img.width(img.height() * origRatio);
            }
          } else {
            if (img.data('origWidth') >= possibleWidth) {
              img.width(possibleWidth);
              img.height(img.width() / origRatio);
            }
          }
        }
        $(this).css('left', (possibleWidth - $(this).width()) / 2);
      });
    };
    self.updateCaption = function (imageIndex) {
      var html = '';
      html += (self.title) ? self.title + '&nbsp;&middot;&nbsp;' : '';
      html += self.currentIndex + 1 + '/' + self.images.length + '&nbsp;&middot;&nbsp;';
      html += self.images[imageIndex]['alt']; 
      $('#caption').html(html);
    };
    self.play = function () {
      if (self.intval === '') {
        self.intval = setInterval(function () {
          self.next();
        }, self.slideInterval);
        $('#play').css('display', 'none');
        $('#pause').css('display', 'block');
        $('#prevLink').css('display', 'none');
        $('#nextLink').css('display', 'none');
        $('#prev').css('visibility', 'hidden');
        $('#next').css('visibility', 'hidden');
      } else {
        self.pause();
      }
    };
    self.pause = function () {
      if (!(self.intval === '')) {
        clearInterval(self.intval);
        self.intval = '';
        $('#pause').css('display', 'none');
        $('#play').css('display', 'block');
        $('#prevLink').css('display', 'block');
        $('#nextLink').css('display', 'block');
        $('#prev').css('visibility', 'visible');
        $('#next').css('visibility', 'visible');
      }
    };
    self.init = function () {
      $(document).keydown(function (event) {
        if (event.which === 37) {
          if (self.intval === '') {
            self.prev();
          }
        }
        if (event.which === 39) {
          if (self.intval === '') {
            self.next();
          }
        }
      });
      $('#home').append('<a href="' + self.homeUrl + '">&nbsp;</a>');
      $('#prevLink a').click(function () {
        self.prev();
        return false;
      });
      $('#prev a').click(function () {
        self.prev();
        return false;
      });
      $('#nextLink a').click(function () {
        self.next();
        return false;
      });
      $('#next a').click(function () {
        self.next();
        return false;
      });
      $('#play a').click(function () {
        self.play();
        return false;
      });
      $('#pause a').click(function () {
        self.pause();
        return false;
      });
      self.addImage(self.currentIndex, function () {
        $('.slide-' + self.currentIndex).addClass('activeslide');
        self.resize();
      });
      self.updateCaption(self.currentIndex);
      if (self.autoplay === 1) {
        self.play();
      }
    };
    self.init();
  };
  $.fn.gallery = function (options){
      return this.each(function () {
          (new $.gallery(options));
      });
  };
})(jQuery);
