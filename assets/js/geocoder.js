/**
  * Geocodes a list of addresses from a CSV file uploaded by the user.
  */
var geocoder = (function($) {

  /**
   * Initializer for Geocoder waits until user uploads a csv file.
   */
  var init = function(settings) {
    $('#file').bind('change', fileSelect);
  };

  /**
   * Deafult values
   */
  var config = {
    addresses: [],
    delay: 600,
    geocoder: new google.maps.Geocoder(),
    nextAddressIndex: 0
  };

  /**
   * Get all adddresses in the CSV file uploaded by user.
   */
  var fileSelect = function() {
    $('input[type=file]').parse({
      config: {
        header: true,
        complete: function(results) {
          config.addresses = results.data;
          nextAddress();
        }
      }
    });
  }

  /**
   * Run through all adddresses found in the CSV file.
   */
  var nextAddress = function() {
    $('#loading').removeClass('hide').delay(1000).fadeOut().fadeIn('slow');
    if (config.nextAddressIndex < config.addresses.length) {
      setTimeout(function() { geocodeAddress(config.addresses[config.nextAddressIndex].Address, nextAddress) }, config.delay);
    } else {
      $('#loading').addClass('hide');
    }
  }

  /**
   * Geocodes address and handles the result based on the geocodes status.
   *
   * @note Status
   *    * OK: Send address to be displayed
   *    * OVER_QUERY_LIMIT: Re-run geocode for the same address
   *    * OTHER: Send address to be displayed with false attributes and
   *             its status
   *
   * @param {String} adddress
   * @param {function()} callback
   */
  var geocodeAddress = function(address, callback) {
    config.geocoder.geocode({ 'address': address }, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        outputToPage(address, isSingleResult(results), isNonPartial(results), isRooftop(results), status);
      } else if (status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
        config.nextAddressIndex--;
      } else {
        outputToPage(address, false, false, false, status);
      }

      config.nextAddressIndex++;
      callback();
    });
  }

  /**
   * Outputs the address information into a table.
   *
   * @param {String} adddress
   * @param {Boolean} isSingleResult
   * @param {Boolean} isNonPartial
   * @param {Boolean} isRooftop
   * @param {String} status
   */
  var outputToPage = function(address, isSingleResult, isNonPartial, isRooftop, status) {
    var tr = '<tr>';

    if (isSingleResult && isNonPartial && isRooftop) {
      tr = '<tr class="success">';
    } else if (isSingleResult && (isNonPartial || isRooftop)) {
      tr = '<tr class="warning">';
    } else if (status != google.maps.GeocoderStatus.OK) {
      tr = '<tr class="danger">';
    }

    $('table#addresses tbody').append(
      tr +
      '<td>' + config.nextAddressIndex + '</td>' +
      '<td>' + address + '</td>' +
      '<td>' + isNonPartial + '</td>' +
      '<td>' + isRooftop + '</td>' +
      '<td>' + status + '</td></tr>'
    );
  }

  /**
   * Returns true when the address has a location type of ROOFTOP.
   *
   * @param {Array} results
   */
  var isRooftop = function(results) {
    return results[0].geometry.location_type == "ROOFTOP";
  }

  /**
   * Returns true when the result from the address is a non-partial match.
   *
   * @param {Array} results
   */
  var isNonPartial = function(results) {
    return results.length == 1 && results[0].partial_match == null;
  }

  /**
   * Returns true when the address has a single result.
   *
   * @param {Array} results
   */
  var isSingleResult = function(results) {
    return results.length == 1;
  }

  return {
    init: init,
  };

})(jQuery);