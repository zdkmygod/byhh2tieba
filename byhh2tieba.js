url_redirect();
$(function(){
  modify_page();
  $('body').addClass('inited');
});
/**
 *util 
 */
var myutil = {
  //转意符换成普通字符
  escape2Html: function (str) {
    if('string' != typeof(str)) return str;
    var arrEntities={'lt':'<','gt':'>','nbsp':' ','amp':'&','quot':'"'};
    var new_str = str.replace(/&(lt|gt|nbsp|amp|quot);/ig,function(all,t){
      return arrEntities[t];
    })
    return new_str;
  }
}
/**
 *url
 *现在不确定那种办法更好，待修改
 */
function url_redirect() {
  var redirect_list = [
    {'from': /([\s\S]+?.cn)\/main.html([\s\S]*)/, 'to': '$1/bbsmain.html'},
    {'from': /([\s\S]+?.cn)\/cgi-bin\/bbsdoc\?board=([\s\S]+?)/, 'to': '$1/cgi-bin/bbsnewtdoc?board=$2'},
    {'from': /([\s\S]+?.cn)\/cgi-bin\/bbscon\?board=([\s\S]+?)&file=([\s\S]+?)&([\s\S]+)/, 'to': '$1/cgi-bin/bbsnewtcon?board=$2&file=$3'}
  ];
  for(i in redirect_list) {
    var href_path = window.location.href;
    var redir_from = redirect_list[i].from;
    var redir_to = redirect_list[i].to;
    if(redir_from.test(href_path)) {
      var new_href_path = href_path.replace(redir_from, redir_to);
      window.location.href = new_href_path;
    }
  }
}

function modify_page() {
  var page_list = [
    {'page': /^\/cgi-bin\/bbsnewtcon/, 'callback': modify_topic_page},
    {'page': /^\/cgi-bin\/bbsnewtdoc/, 'callback': modify_list_page},
    {'page': /^\/cgi-bin\/bbsmain.html/, 'callback': modify_home_page},
  ];
  for(i in page_list) {
    var page_reg = page_list[i].page;
    var callback_func = page_list[i].callback;
    var path_name = window.location.pathname;
    if(page_reg.test(path_name)) {
      modify_init();
      callback_func();
    }
  }
}
var modify_init = function modify_init() {
  $('body').children().wrapAll('<div id="b2t_wrap"></div>');
}

var modify_topic_page = function modify_topic_page() {
  b2t_wrap = $('#b2t_wrap');
  b2t_wrap.children().wrapAll('<div id="b2t_page_wrap_old"></div>');
  $('#b2t_page_wrap_old').hide();//隐藏老的界面
  //structure创建结构
  var page_wrap = get_topic_page_dom();
  /** 
   *page_main_notside
   */
  //get old title detail array
  var byhh_title_match = $('.articletopinfo').html().match(/<a href="([\s\S]+?)">([\s\S]+?)<\/a>/g);
  var byhh_title_array = [];
  byhh_title_match.map(function(item,i){
    byhh_title_array[i] = item.match(/<a href="([\s\S]+?)">([\s\S]+?)<\/a>/);
  });
  //get topic tilte
  var topic_title_content_temp = byhh_title_array[3][2].match(/\《([\s\S]+?)\》/);
  var topic_title_content = topic_title_content_temp[1];
  //get only_lz link
  var lz_article_link_temp = $('.prearticle').eq(0).html().match(/本篇全文<\/a>\] \[<a href="([\s\S]+?)">只看该作者<\/a>/);
  var lz_article_link = myutil.escape2Html(lz_article_link_temp[1]);
  //get all_article_list_link
  var all_article_list_link_temp = $('#main>a').attr('href');
  var all_article_list_link = myutil.escape2Html(all_article_list_link_temp);
  //get replay article link
  var reply_article_link_temp = $('#link a').eq(0).attr('href');
  var reply_article_link = myutil.escape2Html(reply_article_link_temp);
  //page>main>notside>topic>title_wrap
  var topic_title_info = {
    'content': topic_title_content,
    'lz_link': lz_article_link,
    'all_link': all_article_list_link,
    'reply_link': reply_article_link
  };
  topic_title_wrap = get_topic_title_dom(topic_title_info);
  topic_title_wrap.appendTo(page_wrap.find('#b2t_page_main_notside'));
  //get page post list data
  var post_detail_list = [];
  $('pre>.tablearticle').each(function(i, item){
    var post_detail = [];
    user_td = $(item).find('.tduserinfo');
    post_detail['user'] = get_user_info(user_td);
    article_td = $(item).find('.tdarticle');
    post_detail['article'] = get_article_info(article_td);
    post_detail_list[i] = post_detail;
  });
  //page>main>notside>topic>article_list_wrap
  var topic_post_list_wrap = $('<div id="b2t_topic_post_list_wrap"></div>');
  post_detail_list.map(function(item, i){
    var topic_post_wrap = $('<div class="b2t_topic_post_wrap"></div>');
    var post_user_dom = get_post_user_dom(item['user']);
    var post_article_dom = get_post_article_dom(item['article']);
    topic_post_wrap.append(post_user_dom).append(post_article_dom);
    topic_post_wrap.appendTo(topic_post_list_wrap);
  });
  topic_post_list_wrap.appendTo(page_wrap.find('#b2t_page_main_notside'));
  //创建新的界面
  b2t_wrap.append(page_wrap);
}

var modify_list_page = function modify_list_page() {

}

var modify_home_page = function modify_home_page() {

}
  function get_user_info(user_td) {
    var user_info = {};
    var user_a = user_td.find('a');
    var user_img = user_td.find('img');
    var user_detail_tr_list = user_td.find('.tablearticle tr');
    user_info.link = user_a.attr('href');
    user_info.name = user_a.text();
    user_info.face = user_img.attr('src');
    user_info.detail = [];
    user_detail_tr_list.each(function(i, user_detail_tr){
      td_list = $(user_detail_tr).find('td');
      key = td_list.eq(0).text();
      value = td_list.eq(1).text();
      user_info['detail'][key] = value;
    });
    return user_info;
  }

  function get_article_info(article_td) {
    var article_info = {};
    var article_all = article_td.find('.prearticle').html();
    article_match = article_all.match(/([\s\S]+?)\n\n([\s\S]+?)\n([-]+)\n([\s\S]+?)/);
    article_send_time_match = article_match[1].match(/\(([0-9]{4})年([0-9]{2})月([0-9]{2})日([0-9]{2}:[0-9]{2}:[0-9]{2}) ([\s\S]+?)\)/);
    article_info.send_time = article_send_time_match[1]+'-'+article_send_time_match[2]+'-'+article_send_time_match[3]+' '+article_send_time_match[4];
    article_lou_match = article_match[1].match(/第([1-9]+?楼)/);
    article_info.lou = article_lou_match ? article_lou_match[1] : '楼主';
    article_info.reply_link = article_td.find('.prearticle a').eq(0).attr('href');
    article_info.content = article_match[2];
    return article_info;
  }

  function get_topic_page_dom() {
    var topic_page = $(
      '\
      <div id="b2t_page_wrap" class="b2t_body">\
        <div id="b2t_page_top"></div>\
        <div id="b2t_page_main">\
          <div id="b2t_page_main_notside"></div>\
          <div id="b2t_page_main_side"><div>\
        </div>\
        <div id="b2t_page_foot"></div>\
      </div>\
      '
    );
    return topic_page;
  }

  function get_topic_title_dom(title_info) {
    var title_div = $(
      '\
      <div id="b2t_topic_title_wrap" class="core_title">\
        <h1 id="b2t_title_h1" class="core_title_txt"></h1>\
        <ul class="core_title_btns">\
          <li><a href="" class="l_lzonly"><p>只看楼主</p></a></li>\
          <li><a href="" class="l_lzonly"><p>所有帖子</p></a></li>\
          <li><a href="" class="l_lzonly id="reply"><p class="j_quick_reply">回复</p></a></li>\
        </ul>\
      </div>\
      '
    );
    title_div.find('h1').text(title_info['content']);
    title_div.find('.core_title_btns li a').eq(0).attr('href', title_info['lz_link']);
    title_div.find('.core_title_btns li a').eq(1).attr('href', title_info['all_link']);
    title_div.find('.core_title_btns li a').eq(2).attr('href', title_info['reply_link']);
    return title_div;
  }

  function get_post_user_dom(user_info) {
    var user_div = $(
      '\
      <div class="b2t_post_user_wrap">\
        <ul class="p_author">\
          <li class="icon">\
            <a class="p_user_face">\
              <img src=""/>\
            </a>\
          </li>\
          <li class="d_nameplate"></li>\
          <li class="user_name">\
            <a class="" href=""></a>\
          </li>\
          <li class="l_badge">\
            <div class="p_badge">\
              <a class="user_badge d_badge_bright d_badge_icon" title="">\
                <div class="d_badge_title"></div>\
                <div class="d_badge_lv"></div>\
              </a>\
            </div>\
          </li>\
      '
    );
    console.log(user_info);
    user_div.find('img').attr('src', user_info['face']);
    user_div.find('.user_name a').attr('href', user_info['link']).text(user_info['name']);
    user_div.find('.d_badge_title').text(user_info['detail']['等级：']);
    return user_div;
  }

  function get_post_article_dom(article_info) {
    var article_div = $(
      '\
      <div class="b2t_post_article_wrap">\
        <pre></pre>\
        <div class="core_reply_wrapper">\
          <ul>\
            <li><span class="post_lou">二楼</span></li>\
            <li><span class="time_span"></span></li>\
            <li><a  class="reply_link" href="">回复</a></li>\
          </ul>\
        </div>\
      </div>\
      <div style="clear:both"></div>\
      '
    );
    article_div.find('.time_span').text(article_info['send_time']);
    article_div.find('.post_lou').text(article_info['lou']);
    article_div.find('.reply_link').attr('href', article_info['reply_link']);
    article_div.find('pre').html(article_info['content']);
    return article_div;
  }

  function get_footer_pager_dom(pager_info) {
    var pager_dom = $(
      '\
      <div class="p_thread">\
        <div class="l_thread_info">\
          <ul class="l_posts_num">\
            <li class="l_pager"></li>\
            <li class="l_reply_num">\
              <span class="red"></span>回复贴，共<span class="red"></span>页\
            </li>\
            <li class="l_reply_num"></li>\
          </ul>\
        </div>\
        <div id="tofrs_up" class="tofrs_up">\
          <a href="">&lt;&lt;返回<span></span>讨论区</a>\
        </div>\
      </div>\
      '
    );
    pager_dom.find('.l_pager').append(get_footer_pager_list_dom(pager_info['page_list']).children());
    pager_dom.find('.l_reply_num span').eq(0).text(pager_info['post_number']);
    pager_dom.find('.l_reply_num span').eq(1).text(pager_info['page_number']);
    pager_dom.find('.tofrs_up a').attr('href', pager_info['board_link']).text(pager_info['board_name']);
    return pager_dom;
  }

  function get_footer_pager_list_dom(pager_list) {
    var dom_wrap = $('<div>');
    var single_pager = $('<a href=""></a>');
    var single_pager_span = $('<span class="selectd"></span>');
    pager_list.map(function(item, i){
      var single_dom;
      if(!item.link) {
        single_dom = single_pager_span.clone();
        dom_wrap.append(single_dom.text(item.value));
      }else{
        single_dom = single_pager.clone();
        dom_wrap.append(single_dom.attr('href', item.link).text(item.value));
      }
    });
    return dom_wrap;
  }