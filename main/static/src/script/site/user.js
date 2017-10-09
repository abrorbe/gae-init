'use strict';

window.init_user_list = () => {
  init_user_selections();
  init_user_delete_btn();
  init_user_merge_btn();
};

let init_user_selections = () => {
  $('input[name=user_db]').each(function() {
    user_select_row($(this));
  });
  $('#select-all').change(function() {
    $('input[name=user_db]').prop('checked', $(this).is(':checked'));
    $('input[name=user_db]').each(function() {
      user_select_row($(this));
    });
  });
  $('input[name=user_db]').change(function() {
    user_select_row($(this));
  });
};

let user_select_row = $element => {
  update_user_selections();
  $('input[name=user_db]').each(() => {
    let id;
    id = $element.val();
    $(`#${id}`).toggleClass('warning', $element.is(':checked'));
  });
};

update_user_selections = () => {
  let selected;
  selected = $('input[name=user_db]:checked').length;
  $('#user-actions').toggleClass('hidden', selected === 0);
  $('#user-merge').toggleClass('hidden', selected < 2);
  if (selected === 0) {
    $('#select-all').prop('indeterminate', false);
    $('#select-all').prop('checked', false);
  } else if ($('input[name=user_db]:not(:checked)').length === 0) {
    $('#select-all').prop('indeterminate', false);
    $('#select-all').prop('checked', true);
  } else {
    $('#select-all').prop('indeterminate', true);
  }
};

let init_user_delete_btn = () =>
  $('#user-delete').click(function(event) {
    clear_notifications();
    event.preventDefault();
    let confirm_message = $(this)
      .data('confirm')
      .replace('{users}', $('input[name=user_db]:checked').length);
    if (confirm(confirm_message)) {
      let user_keys = [];
      $('input[name=user_db]:checked').each(function() {
        $(this).attr('disabled', true);
        user_keys.push($(this).val());
      });
      let delete_url = $(this).data('api-url');
      let success_message = $(this).data('success');
      let error_message = $(this).data('error');
      api_call(
        'DELETE',
        delete_url,
        {
          user_keys: user_keys.join(','),
        },
        (err, result) => {
          if (err) {
            $('input[name=user_db]:disabled').removeAttr('disabled');
            show_notification(error_message.replace('{users}', user_keys.length), 'danger');
            return;
          }
          $(`#${result.join(', #')}`).fadeOut(function() {
            $(this).remove();
            update_user_selections();
            show_notification(success_message.replace('{users}', user_keys.length), 'success');
          });
        },
      );
    }
  });

window.init_user_merge = () => {
  let user_keys = $('#user_keys').val();
  let api_url = $('.api-url').data('api-url');
  api_call(
    'GET',
    api_url,
    {
      user_keys,
    },
    (error, result) => {
      if (error) {
        LOG('Something went terribly wrong');
        return;
      }
      window.user_dbs = result;
      $('input[name=user_db]').removeAttr('disabled');
    },
  );
  $('input[name=user_db]').change(event => {
    let user_key = $(event.currentTarget).val();
    select_default_user(user_key);
  });
};

let select_default_user = user_key => {
  $('.user-row')
    .removeClass('success')
    .addClass('danger');
  $(`#${user_key}`)
    .removeClass('danger')
    .addClass('success');
  for (let user_db of user_dbs) {
    if (user_key === user_db.key) {
      $('input[name=user_key]').val(user_db.key);
      $('input[name=username]').val(user_db.username);
      $('input[name=name]').val(user_db.name);
      $('input[name=email]').val(user_db.email);
      break;
    }
  }
};

let init_user_merge_btn = () =>
  $('#user-merge').click(function(event) {
    event.preventDefault();
    let user_keys = [];
    $('input[name=user_db]:checked').each(function() {
      user_keys.push($(this).val());
    });
    let user_merge_url = $(this).data('user-merge-url');
    window.location.href = `${user_merge_url}?user_keys=${user_keys.join(',')}`;
  });
